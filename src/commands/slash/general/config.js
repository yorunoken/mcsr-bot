const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

async function run(interaction, values) {
  let changedValues = "";
  for (const x of values) {
    for (const [key, value] of Object.entries(x)) {
      await writeConfig(key, value, interaction);
      changedValues += `**${key}:** \`${value}\`\n`;
    }
  }

  const embed = new EmbedBuilder().setColor("Purple").setTitle("Changed values:").setDescription(`${changedValues}`);
  interaction.reply({ embeds: [embed] });
}

async function writeConfig(c_n, c_v, interaction) {
  const data = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
  data[interaction.user.id] = { ...data[interaction.user.id], [c_n]: c_v };
  await fs.promises.writeFile("./src/db/user-data.json", JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Change your configs")
    .addBooleanOption((option) => option.setName("discord").setDescription("Whether or not to display your discord user in /profile")),
  run: async (client, interaction) => {
    const discord = {
      discord: interaction.options.getBoolean("discord").toString().toLowerCase(),
    };
    const values = [discord];

    await run(interaction, values);
  },
};
