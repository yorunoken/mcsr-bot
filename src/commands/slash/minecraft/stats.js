const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatchStats } = require("../../../utilities/functions/getMatchStats");

async function run(client, interaction, ID) {
  await interaction.deferReply();
  const api = new ranked_api();
  let GoodToGo = false;
  let EmbedValue = 0;

  function EmbedFetch(embeds) {
    try {
      const title = embeds[0].title;
      if (title == undefined) {
        throw new Error("no title");
      }
      const matchID = title.replace("Match ID: ", "");
      if (isNaN(matchID)) {
        throw new Error("no match ID");
      }
      GoodToGo = true;
      return matchID;
    } catch (err) {
      EmbedValue++;
    }
  }

  if (ID) {
    const matchID = ID;
    let match;
    try {
      match = await api.getMatchStats(matchID);
    } catch (err) {
      interaction.editReply("Please provide a valid match ID");
      return;
    }
    const _embed = await getMatchStats(match);
    interaction.editReply({ embeds: [_embed] });
    return;
  }

  const channel = client.channels.cache.get(interaction.channelId);
  channel.messages.fetch({ limit: 100 }).then(async (messages) => {
    let embedMessages = [];
    for (const [id, message] of messages) {
      if (message.embeds.length > 0 && message.author.bot) {
        embedMessages.push(message);
      }
    }

    let matchID;
    if (!embedMessages) {
      await interaction.editReply("No embeds found in the last 100 messages");
      return;
    }

    let tryCount = 0;

    do {
      try {
        if (tryCount > 100) {
          interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("No match embeds found in the last 100 messages.")] });
          return;
        }
        tryCount++;
        if (!embedMessages[EmbedValue].embeds[0]) break;
        matchID = EmbedFetch(embedMessages[EmbedValue].embeds);
      } catch (e) {}
    } while (!GoodToGo);

    const match = await api.getMatchStats(matchID);
    const _embed = await getMatchStats(match);
    interaction.editReply({ embeds: [_embed] });
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Get the stats of a match")
    .addStringOption((option) => option.setName("id").setDescription("ID of a match").setRequired(false)),
  run: async (client, interaction) => {
    const matchID = interaction.options.getString("matchID");

    await run(client, interaction, matchID);
  },
};
