const { SlashCommandBuilder } = require("@discordjs/builders");
const { ranked_api } = require("mcsr-ranked-api");

async function run(interaction) {
  interaction.reply(`Pong! 🏓`).then(async (msg) => {
    let time = msg.createdTimestamp - interaction.createdTimestamp;
    const api = new ranked_api();

    const profile_start_time = Date.now();
    await api.getUserStats("yorunoken");
    let profile_time = Date.now() - profile_start_time;

    msg.edit(`Pong! 🏓(${profile_time}ms)`);
  });
}

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check Ranked API's latency!"),
  run: async (client, interaction) => {
    await run(interaction);
  },
};
