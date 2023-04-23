const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

async function run(interaction, values, db) {
  let configV = "";
  for (const config of values) {
    for (const [key, value] of Object.entries(config)) {
      await writeConfig(key, value, interaction, db);
      configV += `**${key}:** \`${value}\`\n`;
    }
  }

  const embed = new EmbedBuilder().setColor("Purple").setTitle("Changed values:").setDescription(`${configV}`);
  interaction.reply({ embeds: [embed] });
}

async function writeConfig(c_n, c_v, interaction, db) {
  const collection = db.collection("user_data");
  const filter = { [interaction.user.id]: { $exists: true } };
  const update = { $set: { [`user.${interaction.user.id}.${c_n}`]: c_v } };
  const options = { upsert: true };

  await collection.updateOne(filter, update, options);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Change your configs")
    .addBooleanOption((option) => option.setName("discord").setDescription("Whether or not to display your discord user in /profile")),
  run: async (client, interaction, db) => {
    let discord = interaction.options.getBoolean("discord")
      ? {
          discord: interaction.options.getBoolean("discord").toString().toLowerCase(),
        }
      : "";

    const values = [discord];

    await run(interaction, values, db);
  },
};
