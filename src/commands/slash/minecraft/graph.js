const { getGraph } = require("../../../utilities/functions/getGraph.js");
const { ranked_api } = require("mcsr-ranked-api");
const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

async function run(response, username) {
  const api = new ranked_api();

  let ranked_data, user;
  try {
    user = await api.getUserStats(username);
    ranked_data = await api.getRecentMatch(username, { match_type: 2, count: 50 });
  } catch (err) {
    await response.edit({ ephemeral: true, content: "", embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const _function = await getGraph(user, ranked_data);
  await response.edit({ embeds: [_function.embed], files: [_function.attachment] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("graph")
    .setDescription("Get an elo graph of recent matches")
    .addStringOption((option) => option.setName("username").setDescription("Get graph by username").setRequired(false)),
  run: async (client, interaction) => {
    const response = await interaction.reply("Processing...");
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
        await response.edit({ ephmeral: true, content: "Set your minecraft username using /link" });
        return;
      }
      username = username.replace(/!{ENCRYPTED}$/, "");
    }

    await run(response, username);
  },
};
