const { EmbedBuilder } = require("discord.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatchStats } = require("../../../utilities/functions/getMatchStats");

async function run(client, message, args, prefix) {
  await message.channel.sendTyping();

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

  if (message.reference && message.mentions.repliedUser?.bot) {
    const channel = client.channels.cache.get(message.reference.channelId);
    const embedMessage = channel.messages.cache.get(message.reference.messageId);
    if (embedMessage.embeds.length == 0) {
      embedMessage.channel.send({ embeds: new EmbedBuilder().setColor("Purple").setDescription("Reply to an embed of the match.") });
      return;
    }

    const matchID = EmbedFetch(embedMessage.embeds);
    if (!matchID) {
      message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Reply to an embed of the match")] });
      return;
    }
    const match = await api.getMatchStats(matchID);
    const embed = await getMatchStats(match);
    message.channel.send({ embeds: [embed] });
    return;
  }

  if (args[0]) {
    const matchID = args[0];
    if (isNaN(matchID)) {
      message.reply("Please provide a valid match ID");
      return;
    }
    let match;
    try {
      match = await api.getMatchStats(matchID);
    } catch (err) {
      message.reply("Please provide a valid match ID");
      return;
    }
    const _embed = await getMatchStats(match);
    message.channel.send({ embeds: [_embed] });
    return;
  }

  const channel = client.channels.cache.get(message.channel.id);
  channel.messages.fetch({ limit: 100 }).then(async (messages) => {
    let embedMessages = [];
    for (const [id, message] of messages) {
      if (message.embeds.length > 0 && message.author.bot) {
        embedMessages.push(message);
      }
    }

    let matchID;
    if (!embedMessages) {
      await message.channel.send("No embeds found in the last 100 messages");
      return;
    }

    let tryCount = 0;

    do {
      try {
        if (tryCount > 100) {
          message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("No match embeds found in the last 100 messages.")] });
          return;
        }
        tryCount++;
        if (!embedMessages[EmbedValue].embeds[0]) break;
        matchID = EmbedFetch(embedMessages[EmbedValue].embeds);
      } catch (e) {}
    } while (!GoodToGo);

    const match = await api.getMatchStats(matchID);
    const _embed = await getMatchStats(match);
    message.channel.send({ embeds: [_embed] });
  });
}

module.exports = {
  name: "stats",
  aliases: ["matchstats", "stats"],
  cooldown: 5000,
  run: async (client, message, args, prefix) => {
    await run(client, message, args, prefix);
  },
};
