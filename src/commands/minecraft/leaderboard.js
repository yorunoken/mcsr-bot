const { getLeaderboard } = require("../../utilities/functions/getLeaderboard.js");
const { ranked_api } = require("mcsr-ranked-api");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new ranked_api();

	let page = 1;
	if (args.includes("-p")) {
		page = Number(args[args.indexOf("-p") + 1]);
		if (isNaN(page)) {
			message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide a page value")] });
			return;
		}
		if (page <= 0) {
			message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide an index value grater than 0")] });
			return;
		}
	}

	const leaderboard_data = await api.getGlobalLeaderboard();
	const embed = await getLeaderboard(leaderboard_data, page);
	message.channel.send({ embeds: [embed] });
};
exports.name = "leaderboard";
exports.aliases = ["leaderboard", "lb"];
exports.description = [
	"get mcsr ranked global leaderboard\n\n**Parameters**\n`-p (number)` replace (number) to sort through pages defaults to 1.\n[mcsr ranked website](https://mcsrranked.com/)\n[user profile website](https://disrespec.tech/elo/)",
];
exports.usage = [`matches yorunoken\nranked feinberg -i 4\nranked specnr -casual -i 1`];
exports.category = ["minecraft"];
