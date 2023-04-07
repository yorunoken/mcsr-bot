const fs = require("fs");
const { ranked_api } = require("mcsr-ranked-api");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new ranked_api();

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

	const userData = JSON.parse(await fs.promises.readFile("./user_seeds.json"));
	userData[message.author.id] = { ...userData[message.author.id], MinecraftUserID: `${user_id}!{ENCRYPTED}` };
	await fs.promises.writeFile("./user-data.json", JSON.stringify(userData, null, 2));
	message.reply(`Set Minecraft uuid to **${user_id}**`);
};
exports.name = "link";
exports.aliases = ["link"];
exports.description = ["Sets a nickname as your default\n\n**Parameters:**\n`username` set your username to the argument"];
exports.usage = [`link YoruNoKen`];
exports.category = ["minecraft"];
