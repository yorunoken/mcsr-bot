const { SlashCommandBuilder } = require("@discordjs/builders");

async function run(interaction, username, opponentname, ENCRYPTED, match_type, page) {
  const api = new ranked_api();

  if (_userArgs.endsWith("!{ENCRYPTED}")) {
    _userArgs = _userArgs.replace(/!{ENCRYPTED}$/, "");
    ENCRYPTED = true;
  }

  let ranked_data;
  try {
    ranked_data = await api.getRecentMatch(username, { match_type: match_type, opponent: opponentname });
  } catch (err) {
    message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const embed = await getMatchesList(ranked_data, ENCRYPTED, username, page);

  message.channel.send({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("matchlist")
    .setDescription("Get a user's selected match list")
    .addStringOption((option) => option.setName("user").setDescription("get a match by username").setRequired(false))
    .addStringOption((option) => option.setName("opponent").setDescription("get a profile by username").setRequired(false))
    .addIntegerOption((option) => option.setName("page").setDescription("Page of the list").setMinValue(1).setMaxValue(5).setRequired(false))
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
    let page = interaction.options.getInteger("page") ?? 1;

    await run(interaction, username, opponent, ENCRYPTED, match_type, page);
  },
};
