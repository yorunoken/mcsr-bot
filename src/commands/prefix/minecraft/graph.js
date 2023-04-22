const { getGraph } = require("../../../utilities/functions/getGraph.js");
const { ranked_api } = require("mcsr-ranked-api");
const { FindUserargs } = require("../../../utilities/findUserargs.js");
const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

async function run(client, message, args, prefix) {
  await message.channel.sendTyping();

  const api = new ranked_api();

  var userArgs = await FindUserargs(message, args, prefix);
  if (userArgs === undefined) return;

  try {
    if (args[0] == undefined) {
      const user_data = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
      userArgs = user_data[message.author.id].MinecraftUserID;
    }
  } catch (err) {
    return;
  }

  userArgs = userArgs.replace(/!{ENCRYPTED}$/, "");

  try {
    var user = await api.getUserStats(userArgs);
    var ranked_data = await api.getRecentMatch(userArgs, { match_type: 2, count: 50 });
  } catch (err) {
    message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const _function = await getGraph(user, ranked_data);
  message.channel.send({ embeds: [_function.embed], files: [_function.attachment] });
}

module.exports = {
  name: "graph",
  aliases: ["graph", "g"],
  cooldown: 5000,
  run: async (client, message, args, prefix) => {
    await run(client, message, args, prefix);
  },
};
