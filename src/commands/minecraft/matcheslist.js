const { EmbedBuilder } = require("discord.js");
const { FindUserargs } = require("../../utilities/findUserargs.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatchesList } = require("../../utilities/functions/getMatchesList.js");
const fs = require("fs");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new ranked_api();

	let server = "minecraft";
	let page = 1;
	let ENCRYPTED = false;

	let userArgs = await FindUserargs(message, args, server, prefix);

	if (args.includes("-p")) {
		page = Number(args[args.indexOf("-p") + 1]);
		if (isNaN(page)) {
			message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide a page value")] });
			return;
		}
		if (page <= 0) {
			message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide a page value grater than 0")] });
			return;
		}
	}

	let type_arguments = "";
	if (args.includes("-casual")) {
		type_arguments = 1;
	}
	if (args.includes("-ranked")) {
		type_arguments = 2;
	}
	if (args.includes("-private")) {
		type_arguments = 3;
	}

	const unallowed = ["-p", "-page", "-ranked", "-casual"];

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

	const embed = await getMatchesList(ranked_data, ENCRYPTED, userArgs, page);

	message.channel.send({ embeds: [embed] });
};
exports.name = "matcheslist";
exports.aliases = ["matcheslist", "matchrecentlist", "recentmatchlist", "matchlist", "rrlist", "ml", "rrl"];
exports.description = [
	'get a list of recent mcsr ranked matches\n\n**Parameters**\n`username` username of the player you want to get the recent match of. Can be blank but you need to link your account by typing "{prefix}link {userame}\n`-p (number)` replace (number) with your desired page you want, defaults to 1. 2 means 2nd list match 3 means 3rd etc.\n`-casual` gets the list of latest casual match\n`-ranked` gets the list of latest ranked match\n[mcsr ranked website](https://mcsrranked.com/)\n[user profile website](https://disrespec.tech/elo/)',
];
exports.usage = [`matches yorunoken\nranked feinberg -i 4\nranked specnr -casual -i 1`];
exports.category = ["minecraft"];
