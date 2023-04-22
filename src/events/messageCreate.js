const { Collection } = require("discord.js");
const ms = require("ms");
const cooldown = new Collection();

module.exports = {
  name: "messageCreate",
  execute: async (message, database) => {
    let client = message.client;
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    const collection = database.collection("prefixes");
    const prefixes = await collection.findOne();
    const prefix = prefixes[message.guild.id] ?? "!";
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);

    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.commandaliases.get(cmd));
    if (!command) return;

    if (!command.cooldown) {
      command.run(client, message, args);
      return;
    }
    if (cooldown.has(`${command.name}${message.author.id}`))
      return message
        .reply({
          content: `Try again in \`${ms(cooldown.get(`${command.name}${message.author.id}`) - Date.now(), { long: true })}\``,
        })
        .then((msg) => setTimeout(() => msg.delete(), cooldown.get(`${command.name}${message.author.id}`) - Date.now()));

    command.run(client, message, args);
    cooldown.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown);
    setTimeout(() => {
      cooldown.delete(`${command.name}${message.author.id}`);
    }, command.cooldown);
  },
};
