const { getGraph } = require("../../utilities/functions/getGraph.js");
const { ranked_api } = require("mcsr-ranked-api");
const { EmbedBuilder, CommandInteraction } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

async function sendGraphReply({ user, ranked_data, interaction, page }) {
  const _function = await getGraph(user, ranked_data);
  if (_function.games === 0) {
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No games found for user ${user.nickname}`)] });
    return;
  }
  await interaction.editReply({ content: `*Loaded until page index #${page}.*\n*Loaded ${_function.games - 1} games.*`, embeds: [_function.embed], files: [_function.attachment] });
}

async function run(interaction, username) {
  await interaction.deferReply();
  const api = new ranked_api();
  var page = 0;

  try {
    var user = await api.getUserStats(username);
    var ranked_data = [];
    while (page < 100) {
      try {
        var pageData = await api.getRecentMatch(username, { match_type: 2, count: 50, page: page });
      } catch (err) {
        console.error(err);
        break;
      }
      ranked_data = ranked_data.concat(pageData);
      await sendGraphReply({ user, ranked_data, interaction, page });
      if (pageData.length < 50) break;
      page++;
    }
  } catch (err) {
    await interaction.editReply({ ephemeral: true, content: "", embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  await sendGraphReply({ user, ranked_data, interaction, page });
}

async function getUser(interaction, collection) {
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
  }
  return user;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("graph")
    .setDescription("Get an elo graph of recent matches")
    .addStringOption((option) => option.setName("user").setDescription("Get graph by username, or by tagging someone").setRequired(false)),
  run: async (client, interaction, db) => {
    const collection = db.collection("user_data");

    const username = await getUser(interaction, collection);
    if (!username) return;
    await run(interaction, username);
  },
};
