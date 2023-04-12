const { getGraph } = require("../../utilities/functions/getGraph.js");
const { ranked_api } = require("mcsr-ranked-api");
const { FindUserargs } = require("../../utilities/findUserargs.js");
const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new ranked_api();

	var userArgs = await FindUserargs(message, args, prefix);

	try {
		if (args[0] == undefined) {
			const user_data = JSON.parse(await fs.promises.readFile("./user-data.json"));
			userArgs = user_data[message.author.id].MinecraftUserID;
		}
	} catch (err) {
		return;
	}

	userArgs = userArgs.replace(/!{ENCRYPTED}$/, "");

	let ranked_data, user;
	try {
		user = await api.getUserStats(userArgs);
		ranked_data = await api.getRecentMatch(userArgs, { match_type: 2, count: 50 });
	} catch (err) {
		message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
		return;
	}

	const _function = await getGraph(user, ranked_data);
	message.channel.send({ embeds: [_function.embed], files: [_function.attachment] });
};
exports.name = "graph";
exports.aliases = ["graph", "elograph"];
exports.description = ["\n[mcsr ranked website](https://mcsrranked.com/)\n[user profile website](https://disrespec.tech/elo/)"];
exports.usage = [`matches yorunoken\nranked feinberg -i 4\nranked specnr -casual -i 1`];
exports.category = ["minecraft"];
