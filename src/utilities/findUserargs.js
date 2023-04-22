const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

// SUPER old code so don't mind it lol
async function FindUserargs(message, args, prefix) {
  let userargs;
  let inputString = args.join(" ");
  const userData = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
  if (message.mentions.users.size > 0) {
    try {
      let mentionedUser;
      var UserArray = Array.from(message.mentions.users);
      mentionedUser = UserArray[0][1];

      try {
        if (message.reference.messageId && args.join(" ").includes(`<@`)) {
          mentionedUser = UserArray[UserArray.length - 1][1];

          userargs = userData[mentionedUser.id].MinecraftUserID;
        }
      } catch (err) {}

      if (args.join(" ").includes(`<@${mentionedUser.id}>`)) {
        try {
          userargs = userData[mentionedUser.id].MinecraftUserID;
        } catch (err) {
          message.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`No minecraft user found for ${mentionedUser.tag}`)] });
          return;
        }
      } else {
        const regex = /"([^"]+)"|\b\w+\b/g;
        const usernames = inputString.match(regex).map((match) => match.replace(/"/g, ""));

        userargs = usernames;
        if (usernames.length == 1) {
          userargs = usernames[0];
        }
      }
      if (args[0] === undefined) {
        try {
          userargs = userData[message.author.id].MinecraftUserID;
        } catch (err) {
          console.error(err);
          message.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`Either specify a username, or connect your account with /link`)] });
          return;
        }
      }
    } catch (err) {}
  } else {
    if (args[0] === undefined) {
      try {
        userargs = userData[message.author.id].MinecraftUserID;
      } catch (err) {
        console.error(err);
        message.reply({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`Either specify a username, or connect your account with /link"`)] });
        return;
      }
    } else {
      const regex = /"([^"]+)"|\b\w+\b/g;
      const usernames = inputString.match(regex).map((match) => match.replace(/"/g, ""));

      userargs = usernames;
      if (usernames.length == 1) {
        userargs = usernames[0];
      }
    }
  }
  return userargs;
}

module.exports = { FindUserargs };
