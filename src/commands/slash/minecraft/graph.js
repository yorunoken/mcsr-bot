const { getGraph } = require("../../../utilities/functions/getGraph.js");
const { ranked_api } = require("mcsr-ranked-api");
const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

async function run(interaction, username) {
  await interaction.deferReply();
  const api = new ranked_api();

  try {
    var user = await api.getUserStats(username);
    var ranked_data = [];
    var page = 0;
    while (page < 100) {
      try { var pageData = await api.getRecentMatch(username, { match_type: 2, count: 50, page: page }); }
      catch (err) { break; }
      ranked_data = ranked_data.concat(pageData);
      if (pageData.length < 50) break;
      page++;
    }
  } catch (err) {
    await interaction.editReply({ ephemeral: true, content: "", embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const _function = await getGraph(user, ranked_data);
  await interaction.editReply({ embeds: [_function.embed], files: [_function.attachment] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("graph")
    .setDescription("Get an elo graph of recent matches")
    .addStringOption((option) => option.setName("username").setDescription("Get graph by username").setRequired(false)),
  run: async (client, interaction) => {
    let username = interaction.options.getString("username");
    if (!username) {
      const userData = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
      try {
        username =
          userData[interaction.user.id].MinecraftUserID ??
          (() => {
            throw new Error("no userarg");
          })();
      } catch (err) {
        await interaction.reply({ ephmeral: true, content: "Either specify a username, or connect your account with /link" });
        return;
      }
      username = username.replace(/!{ENCRYPTED}$/, "");
    }

    await run(interaction, username);
  },
};
