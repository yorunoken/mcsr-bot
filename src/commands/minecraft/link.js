const { EmbedBuilder } = require("discord.js");
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

	if (username == undefined || username == "") {
		const embed = new EmbedBuilder().setColor("Red").setTitle(`Account linking unsuccessful`).setDescription(`\`\`\`Error: Please provide a username.\`\`\``);
		message.reply({ embeds: [embed] });
		return;
	}

	let user;
	try {
		user = await api.getUserStats(username);
	} catch (err) {
		const embed = new EmbedBuilder().setColor("Red").setTitle(`Account linking unsuccessful`).setDescription(`\`\`\`${err}\`\`\``);
		message.reply({ embeds: [embed] });
		return;
	}

	const user_id = user.uuid;
	const nickname = user.nickname;
	const avatar_url = `https://crafatar.com/avatars/${user_id}.png?overlay`;

	const userData = JSON.parse(await fs.promises.readFile("./user-data.json"));
	userData[message.author.id] = { ...userData[message.author.id], MinecraftUserID: `${user_id}!{ENCRYPTED}` };
	await fs.promises.writeFile("./user-data.json", JSON.stringify(userData, null, 2));

	const embed = new EmbedBuilder()
		.setColor("Green")
		.setTitle(`Account linking successful`)
		.setDescription(`Linked Discord account <@${message.author.id}>\nto Minecraft account **${nickname}**`)
		.setThumbnail(avatar_url)
		.setFooter({ text: `People can now view your Discord profile from your Minecraft profile in the bot ! to turn this off, type "${prefix}config discord=false"` });
	message.reply({ embeds: [embed] });
};
exports.name = "link";
exports.aliases = ["link"];
exports.description = ["Sets a nickname as your default\n\n**Parameters:**\n`username` set your username to the argument"];
exports.usage = [`link YoruNoKen`];
exports.category = ["minecraft"];
