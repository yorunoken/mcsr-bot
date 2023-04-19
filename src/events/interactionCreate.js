const { InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  execute: async (interaction) => {
    let client = interaction.client;
    if (interaction.type == InteractionType.ApplicationCommand) {
      if (interaction.user.bot) return;
      try {
        const command = client.slashcommands.get(interaction.commandName);
        command.run(client, interaction);
      } catch {
        interaction.reply({ content: "There was an error. Please try again", ephemeral: true });
      }
    }
  },
};
