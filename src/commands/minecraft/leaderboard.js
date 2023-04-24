const { getLeaderboard } = require("../../utilities/functions/getLeaderboard.js");
const { ranked_api } = require("mcsr-ranked-api");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

async function run(interaction, page) {
  await interaction.deferReply();
  const api = new ranked_api();

  const nextPage = new ButtonBuilder().setCustomId("next").setLabel("Next page").setStyle(ButtonStyle.Secondary);
  const prevPage = new ButtonBuilder().setCustomId("prev").setLabel("Previous page").setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder().addComponents(prevPage, nextPage);

  const leaderboard_data = await api.getGlobalLeaderboard();
  const embed = await getLeaderboard(leaderboard_data, page);
  const response = await interaction.editReply({ content: "", embeds: [embed], components: [row] });

  const filter = (i) => i.user.id === interaction.user.id;
  const collector = response.createMessageComponentCollector({ time: 60000, filter: filter });

  collector.on("collect", async (i) => {
    if (i.customId === "next") {
      page++;

      if (page > leaderboard_data.length) {
        page--;
      }
      const embed = await getLeaderboard(leaderboard_data, page);
      await i.update({ embeds: [embed], components: [row] });
    } else if (i.customId === "prev") {
      page--;

      if (0 >= page) {
        page++;
      }
      const embed = await getLeaderboard(leaderboard_data, page);
      await i.update({ embeds: [embed], components: [row] });
    }
  });
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
