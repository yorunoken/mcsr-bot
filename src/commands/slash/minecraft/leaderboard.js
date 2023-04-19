const { getLeaderboard } = require("../../../utilities/functions/getLeaderboard.js");
const { ranked_api } = require("mcsr-ranked-api");
const { SlashCommandBuilder } = require("@discordjs/builders");

async function run(interaction, page) {
  const api = new ranked_api();

  const leaderboard_data = await api.getGlobalLeaderboard();
  const embed = await getLeaderboard(leaderboard_data, page);
  interaction.reply({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Get a slice of mcsr ranked leaderboard")
    .addIntegerOption((option) => option.setName("page").setDescription("Provide a page").setMinValue(1).setMaxValue(6).setRequired(false)),
  run: async (client, interaction) => {
    const page = interaction.options.getInteger("page") ?? "1";

    await run(interaction, page);
  },
};
