const fs = require("fs");
const { MCSR } = require("mcsr-api");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new MCSR();

	let string = args.join(" ").match(/"(.*?)"/);
	if (string) {
		username = string[1];
	} else {
		username = args[0];
	}

	if (username == undefined) {
		message.reply("**Please provide a username.**");
		return;
	}

	let user;
	try {
		user = await api.getUserStats(username);
	} catch (err) {
		message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
		return;
	}

	var user_id = user.uuid;
	// Read the JSON file
	fs.readFile("./user-data.json", (error, data) => {
		if (error) {
			console.log(error);
			return;
		}

		//update the user's saber! username in the JSON file
		const userData = JSON.parse(data);
		userData[message.author.id] = { ...userData[message.author.id], MinecraftUserID: `${user_id}!{ENCRYPTED}` };
		fs.writeFile("./user-data.json", JSON.stringify(userData, null, 2), (error) => {
			if (error) {
				console.log(error);
			} else {
				message.reply(`Set Minecraft uuid to **${user_id}**`);
			}
		});
	});
};
exports.name = "link";
exports.aliases = ["link"];
exports.description = ["Sets a nickname as your default\n\n**Parameters:**\n`username` set your username to the argument"];
exports.usage = [`link YoruNoKen`];
exports.category = ["minecraft"];
