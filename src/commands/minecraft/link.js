const fs = require("fs");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();

	let server = "minecraft";

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

	const ranked_base_URL = "https://mcsrranked.com/api";
	const ranked_response = await fetch(`${ranked_base_URL}/users/${username}`).then((res) => res.json());
	const data = ranked_response.data;

	if (ranked_response.status != "success") {
		message.reply(`**The user \`${username}\` does not exist in the Minecraft database.**`);
		return;
	}

	var user_id = data.uuid;
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
