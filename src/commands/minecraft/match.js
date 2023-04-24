const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatch } = require("../../utilities/functions/getMatch.js");
const { getMatchStats } = require("../../utilities/functions/getMatchStats");

async function run(interaction, username, opponentname, ENCRYPTED, match_type, index, collection) {
  await interaction.deferReply();
  const api = new ranked_api();

  let ranked_data;
  try {
    ranked_data = await api.getRecentMatch(username, { match_type: match_type, opponent: opponentname });
  } catch (err) {
    await interaction.editReply({ ephemeral: true, content: "", embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const nextPage = new ButtonBuilder().setCustomId("next").setLabel("➡️").setStyle(ButtonStyle.Secondary);
  const stats = new ButtonBuilder().setCustomId("stats").setLabel("Get statistics").setStyle(ButtonStyle.Primary);
  const prevPage = new ButtonBuilder().setCustomId("prev").setLabel("⬅️").setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder().addComponents(prevPage, stats, nextPage);

  const embed = await getMatch(ranked_data[index - 1], ENCRYPTED, username, index - 1, collection);
  const response = await interaction.editReply({ content: "", embeds: [embed], components: [row] });

  const filter = (i) => i.user.id === interaction.user.id;
  const collector = response.createMessageComponentCollector({ time: 35000, filter: filter });

  let currentMessage = interaction;
  collector.on("collect", async (i) => {
    try {
      if (i.customId === "next") {
        index++;

        if (index > ranked_data.length) {
          index--;
        }
        const embed = await getMatch(ranked_data[index - 1], ENCRYPTED, username, index - 1, collection);

        await i.update({ embeds: [embed], components: [row] });
      } else if (i.customId === "prev") {
        index--;

        if (0 >= index) {
          index++;
        }
        const embed = await getMatch(ranked_data[index - 1], ENCRYPTED, username, index - 1, collection);

        await i.update({ embeds: [embed], components: [row] });
      } else if (i.customId === "stats") {
        let title = i.message.embeds[0].title;
        const matchID = title.replace("Match ID: ", "");
        const match = await api.getMatchStats(matchID);
        const embed = await getMatchStats(match);
        await i.update({ embeds: [embed], components: [] });
      }
      currentMessage = i;
    } catch (e) {}
  });

  collector.on("end", async (i) => {
    await currentMessage.edit({ components: [] });
  });
}

async function getUser(interaction, collection, ENCRYPTED) {
  let user = interaction.options.getString("user");
  const regex = /^<@\d+>$/;
  if (regex.test(user)) {
    const userID = user.match(/\d+/)[0];
    try {
      const users = (await collection.findOne({})).users;
      user =
        users[userID].MinecraftUserID ??
        (() => {
          throw new Error("no userarg");
        })();
    } catch (err) {
      await interaction.reply({ ephmeral: true, content: "The discord user you have provided does not have an account linked." });
      return false;
    }
    user = user.replace(/!{ENCRYPTED}$/, "");
  }
  if (!user) {
    try {
      const users = (await collection.findOne({})).users;
      user =
        users[interaction.user.id].MinecraftUserID ??
        (() => {
          throw new Error("no userarg");
        })();
    } catch (err) {
      await interaction.reply({ ephmeral: true, content: "Either specify a username, or connect your account with /link" });
      return false;
    }
    user = user.replace(/!{ENCRYPTED}$/, "");
    ENCRYPTED = true;
  }
  return { user, ENCRYPTED };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("match")
    .setDescription("Get a user's selected match")
    .addStringOption((option) => option.setName("user").setDescription("get a match by username").setRequired(false))
    .addStringOption((option) => option.setName("opponent").setDescription("get a profile by username").setRequired(false))
    .addIntegerOption((option) => option.setName("index").setDescription("Index of the match").setMinValue(1).setMaxValue(50).setRequired(false))
    .addStringOption((option) => option.setName("type").setDescription("Select a match type").setRequired(false).addChoices({ name: "ranked", value: "2" }, { name: "casual", value: "1" }, { name: "private", value: "3" })),
  run: async (client, interaction, db) => {
    const collection = db.collection("user_data");
    let ENCRYPTED = false;
    const opponent = interaction.options.getString("opponent") ?? undefined;

    const userOptions = await getUser(interaction, collection, ENCRYPTED);
    if (!userOptions) return;

    const match_type = interaction.options.getString("type") ?? undefined;
    const index = interaction.options.getInteger("index") ?? 1;

    await run(interaction, userOptions.user, opponent, userOptions.ENCRYPTED, match_type, index, collection);
  },
};
