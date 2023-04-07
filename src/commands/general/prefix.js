const fs = require("fs");
const { PermissionsBitField } = require("discord.js");
exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();

	//check if args is empty
	if (args.length) {
		//check if the user has permissions to change the prefix
		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return message.reply("You do not have permission to use this command.");
		const newPrefix = args[0];

		//check if the args are valid
		if (!args.length) {
			message.reply("Please enter a prefix.");
			return;
		}

		//set prefix
		const prefixes = JSON.parse(await fs.promises.readFile("./prefixes.json", "utf-8"));
		prefixes[message.guild.id] = newPrefix;
		await fs.promises.writeFile("./prefixes.json", JSON.stringify(prefixes, null, 2));
		message.reply(`set prefix to \`${newPrefix}\``);
		return;
	}

	// Load the prefixes for each guild
	let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
	prefix = prefixes[message.guild.id];
	if (prefix == undefined) {
		prefix = "?";
	}
	message.reply(`my prefix is **${prefix}**`);
};
exports.name = "prefix";
exports.aliases = ["prefix"];
exports.description = ["Displays the prefix for the server if no arguments are provided. \nUsers with admin permissions can change the prefix by providing an argument"];
exports.usage = [`prefix #`];
exports.category = ["general"];
