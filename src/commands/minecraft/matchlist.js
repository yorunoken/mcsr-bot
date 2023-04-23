const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatchesList } = require("../../utilities/functions/getMatchesList.js");

async function run(interaction, username, opponentname, ENCRYPTED, match_type, page) {
  await interaction.deferReply();
  const api = new ranked_api();

  let ranked_data;
  try {
    ranked_data = await api.getRecentMatch(username, { match_type: match_type, opponent: opponentname });
  } catch (err) {
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const nextPage = new ButtonBuilder().setCustomId("next").setLabel("Next match").setStyle(ButtonStyle.Secondary);
  const prevPage = new ButtonBuilder().setCustomId("prev").setLabel("Previous match").setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder().addComponents(prevPage, nextPage);

  const embed = await getMatchesList(ranked_data, ENCRYPTED, username, page);
  const response = await interaction.editReply({ embeds: [embed], components: [row] });

  const filter = (i) => i.user.id === interaction.user.id;
  const collector = response.createMessageComponentCollector({ time: 60000, filter: filter });

  collector.on("collect", async (i) => {
    if (i.customId === "next") {
      page++;

      if (page > ranked_data.length) {
        page--;
      }
      const embed = await getMatchesList(ranked_data, ENCRYPTED, username, page);

      await response.edit({ embeds: [embed], components: [row] });
    } else if (i.customId === "prev") {
      page--;

      if (0 >= page) {
        page++;
      }
      const embed = await getMatchesList(ranked_data, ENCRYPTED, username, page);

      await response.edit({ embeds: [embed], components: [row] });
    }
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
    .setName("matchlist")
    .setDescription("Get a user's selected match list")
    .addStringOption((option) => option.setName("user").setDescription("get a match by username").setRequired(false))
    .addStringOption((option) => option.setName("opponent").setDescription("get a profile by username").setRequired(false))
    .addIntegerOption((option) => option.setName("page").setDescription("Page of the list").setMinValue(1).setMaxValue(5).setRequired(false))
    .addStringOption((option) => option.setName("type").setDescription("Select a match type").setRequired(false).addChoices({ name: "ranked", value: "2" }, { name: "casual", value: "1" }, { name: "private", value: "3" })),
  run: async (client, interaction, db) => {
    const collection = db.collection("user_data");
    let ENCRYPTED = false;
    const opponent = interaction.options.getString("opponent") ?? undefined;

    const userOptions = await getUser(interaction, collection, ENCRYPTED);
    if (!userOptions) return;

    const match_type = interaction.options.getString("type") ?? undefined;
    let page = interaction.options.getInteger("page") ?? 1;

    await run(interaction, userOptions.user, opponent, userOptions.ENCRYPTED, match_type, page);
  },
};
