// const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

function displayPrefix(interaction) {
  interaction.reply("hiii");
}

async function changePrefix(interaction, newPrefix) {
  const prefixes = JSON.parse(await fs.promises.readFile("./src/db/prefixes.json", "utf-8"));
  prefixes[interaction.guild.id] = newPrefix;
  await fs.promises.writeFile("./src/db/prefixes.json", JSON.stringify(prefixes, null, 2));
  interaction.reply(`Prefix changed to ${newPrefix}`);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prefix")
    .setDescription("Change the server prefix")
    .addStringOption((option) => option.setName("input").setDescription("input your prefix here")),
  run: async (client, interaction) => {
    const newPrefix = interaction.options.getString("input");
    newPrefix ? changePrefix(interaction, newPrefix) : displayPrefix(interaction);
  },
};
