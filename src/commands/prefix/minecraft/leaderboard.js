const { getLeaderboard } = require("../../../utilities/functions/getLeaderboard.js");
const { ranked_api } = require("mcsr-ranked-api");

async function run(client, message, args, prefix) {
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
}

module.exports = {
  name: "leaderboard",
  aliases: ["leaderboard", "lb"],
  cooldown: 5000,
  run: async (client, message, args, prefix) => {
    await run(client, message, args, prefix);
  },
};
