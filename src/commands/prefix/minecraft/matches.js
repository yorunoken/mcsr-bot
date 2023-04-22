const { EmbedBuilder } = require("discord.js");
const { FindUserargs } = require("../../../utilities/findUserargs.js");
const { ranked_api } = require("mcsr-ranked-api");
const { getMatch } = require("../../../utilities/functions/getMatch.js");
const fs = require("fs");

async function run(client, message, args, prefix) {
  await message.channel.sendTyping();

  const api = new ranked_api();
  let index = 0;
  let ENCRYPTED = false;
  let isI = false;

  let userArgs = await FindUserargs(message, args, prefix);
  if (userArgs === undefined) return;

  if (args.includes("-i")) {
    if (args[1] == "-i") {
      isI = true;
    }
    index = Number(args[args.indexOf("-i") + 1]) - 1;
    if (isNaN(index)) {
      message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide an index value")] });
      return;
    }
    if (index <= 0) {
      message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription("Please provide an index value grater than 0")] });
      return;
    }
  }

  let type_arguments;
  if (args.includes("-casual")) {
    type_arguments = 1;
  }
  if (args.includes("-ranked")) {
    type_arguments = 2;
  }
  if (args.includes("-private")) {
    type_arguments = 3;
  }

  let opponent;
  let _userArgs = userArgs;
  if (Array.isArray(userArgs)) {
    _userArgs = userArgs[0];
  }
  if (Array.isArray(userArgs) && !isI) {
    opponent = userArgs[1];
    _userArgs = userArgs[0];
  }

  const unallowed = ["-i", "-ranked", "-casual"];
  const user_data = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
  try {
    if (unallowed.some((word) => args.join("").startsWith(word))) {
      _userArgs = user_data[message.author.id].MinecraftUserID;
      opponent = undefined;
    }
  } catch (err) {
    return;
  }

  if (_userArgs.endsWith("!{ENCRYPTED}")) {
    _userArgs = _userArgs.replace(/!{ENCRYPTED}$/, "");
    ENCRYPTED = true;
  }

  let ranked_data;
  try {
    ranked_data = await api.getRecentMatch(_userArgs, { match_type: type_arguments, opponent: opponent });
  } catch (err) {
    message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
    return;
  }

  const embed = await getMatch(ranked_data[index], ENCRYPTED, _userArgs, index);

  message.channel.send({ embeds: [embed] });
}

module.exports = {
  name: "matches",
  aliases: ["matches", "matchrecent", "recentmatch", "match", "rr", "m"],
  cooldown: 5000,
  run: async (client, message, args, prefix) => {
    await run(client, message, args, prefix);
  },
};
