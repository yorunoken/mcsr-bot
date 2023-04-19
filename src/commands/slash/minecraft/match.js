const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatch } = require("../../../utilities/functions/getMatch.js");
const fs = require("fs");

async function run(interaction, username, opponentname, ENCRYPTED, match_type, index) {
  const api = new ranked_api();

  let ranked_data;
  try {
    ranked_data = await api.getRecentMatch(username, { match_type: match_type, opponent: opponentname });
  } catch (err) {
    interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const embed = await getMatch(ranked_data[index], ENCRYPTED, username, index);

  interaction.reply({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("match")
    .setDescription("Get a user's selected match")
    .addStringOption((option) => option.setName("user").setDescription("get a match by username").setRequired(false))
    .addStringOption((option) => option.setName("opponent").setDescription("get a profile by username").setRequired(false))
    .addIntegerOption((option) => option.setName("index").setDescription("Index of the match").setMinValue(1).setMaxValue(50).setRequired(false))
    .addStringOption((option) => option.setName("type").setDescription("Select a match type").setRequired(false).addChoices({ name: "ranked", value: "2" }, { name: "casual", value: "1" }, { name: "private", value: "3" })),
  run: async (client, interaction) => {
    let ENCRYPTED = false;
    const opponent = interaction.options.getString("opponent") ?? undefined;
    let username = interaction.options.getString("user");
    if (!username) {
      const userData = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
      try {
        username = userData[interaction.user.id].MinecraftUserID;
      } catch (err) {
        interaction.reply({ ephmeral: true, content: "Set your minecraft username using /link" });
      }
      username = username.replace(/!{ENCRYPTED}$/, "");
      ENCRYPTED = true;
    }
    const match_type = interaction.options.getString("type") ?? undefined;
    let index = interaction.options.getInteger("index") - 1 ?? 0;
    if (index < 0) {
      index = 0;
    }

    await run(interaction, username, opponent, ENCRYPTED, match_type, index);
  },
};
