const { EmbedBuilder } = require("discord.js");
const { ranked_api } = require("mcsr-ranked-api");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

async function run(interaction, username) {
  await interaction.deferReply();
  const api = new ranked_api();

  let user;
  try {
    user = await api.getUserStats(username);
  } catch (err) {
    const embed = new EmbedBuilder().setColor("Red").setTitle(`Account linking unsuccessful`).setDescription(`\`\`\`${err}\`\`\``);
    interaction.editReply({ ephemeral: true, embeds: [embed] });
    return;
  }

  const user_id = user.uuid;
  const nickname = user.nickname;
  const avatar_url = `https://crafatar.com/avatars/${user_id}.png?overlay`;

  const userData = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
  userData[interaction.user.id] = { ...userData[interaction.user.id], MinecraftUserID: `${user_id}!{ENCRYPTED}` };
  await fs.promises.writeFile("./src/db/user-data.json", JSON.stringify(userData, null, 2));

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(`Account linking successful`)
    .setDescription(`Linked Discord account <@${interaction.user.id}>\nto Minecraft account **${nickname}**`)
    .setThumbnail(avatar_url)
    .setFooter({ text: `People can now view your Discord profile from your Minecraft profile in the bot! to turn this off, see /config` });
  interaction.editReply({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your minecraft account to the bot")
    .addStringOption((option) => option.setName("username").setDescription("Your minecraft username").setRequired(true)),
  run: async (client, interaction) => {
    const username = interaction.options.getString("username");

    await run(interaction, username);
  },
};
