const { getGraph } = require("../../../utilities/functions/getGraph.js");
const { ranked_api } = require("mcsr-ranked-api");
const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

async function run(interaction, username) {
  await interaction.deferReply();
  const api = new ranked_api();

  let ranked_data, user;
  try {
    user = await api.getUserStats(username);
    ranked_data = await api.getRecentMatch(userArgs, { match_type: 2, count: 50 });
  } catch (err) {
    interaction.editReply({ ephemeral: true, embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const _function = await getGraph(user, ranked_data);
  interaction.editReply({ embeds: [_function.embed], files: [_function.attachment] });
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
        username = userData[interaction.user.id].MinecraftUserID;
      } catch (err) {
        interaction.reply({ ephmeral: true, content: "Set your minecraft username using /link" });
      }
      username = username.replace(/!{ENCRYPTED}$/, "");
    }

    await run(interaction, username);
  },
};
