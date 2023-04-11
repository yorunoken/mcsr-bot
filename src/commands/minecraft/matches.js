const { EmbedBuilder } = require("discord.js");
const { FindUserargs } = require("../../utilities/findUserargs.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatch } = require("../../utilities/functions/getMatch.js");
const fs = require("fs");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new ranked_api();
	let index = 0;
	let ENCRYPTED = false;

	let userArgs = await FindUserargs(message, args, prefix);

	if (args.includes("-i")) {
		index = Number(args[args.indexOf("-i") + 1]) - 1;
		if (isNaN(index)) {
			message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide an index value")] });
			return;
		}
		if (index <= 0) {
			message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide an index value grater than 0")] });
			return;
		}
	}

	let type_arguments;
	if (args.includes("-casual")) {
		type_arguments = 1;
	}
	if (args.includes("-ranked")) {
		type_arguments = 2;
	}
	if (args.includes("-private")) {
		type_arguments = 3;
	}

	const unallowed = ["-i", "-ranked", "-casual"];

	const user_data = JSON.parse(await fs.promises.readFile("./user-data.json"));
	try {
		if (unallowed.some((word) => args.join("").startsWith(word))) {
			userArgs = user_data[message.author.id].MinecraftUserID;
		}
	} catch (err) {
		message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`link your account by typing "${prefix}link {userame}`)] });
		return;
	}

	if (userArgs.endsWith("!{ENCRYPTED}")) {
		userArgs = userArgs.replace(/!{ENCRYPTED}$/, "");
		ENCRYPTED = true;
	}

	let ranked_data;
	try {
		ranked_data = await api.getRecentMatch(userArgs, { match_type: type_arguments });
	} catch (err) {
		message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
		return;
	}

	const embed = await getMatch(ranked_data[index], ENCRYPTED, userArgs, index);

	message.channel.send({ embeds: [embed] });
};
exports.name = "matches";
exports.aliases = ["matches", "matchrecent", "recentmatch", "match", "rr", "m"];
exports.description = [
	'get a recent mcsr ranked match\n\n**Parameters**\n`username` username of the player you want to get the recent match of. Can be blank but you need to link your account by typing "{prefix}link {userame} server=minecraft"\n`-i (number)` replace (number) with whichever recent match you want, defaults to 1. 2 means 2nd recent match 3 means 3rd etc.\n`-casual` gets the latest casual match\n`-ranked` gets the latest ranked match\n[mcsr ranked website](https://mcsrranked.com/)\n[user profile website](https://disrespec.tech/elo/)',
];
exports.usage = [`matches yorunoken\nranked feinberg -i 4\nranked specnr -casual -i 1`];
exports.category = ["minecraft"];
