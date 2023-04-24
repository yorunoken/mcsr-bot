const { EmbedBuilder } = require("discord.js");

async function getMatch(match, ENCRYPTED, userArgs, index, collection) {
  if (match == undefined) {
    return new EmbedBuilder().setColor("Purple").setDescription("No recent matches with the filters found.");
  }
  let _index = index + 1;

  /**
    this switch function takes the array, and rearranges them so the first user is the user typed the command
    */

  switch (ENCRYPTED) {
    case true:
      match.members.sort((a, b) => {
        if (a.uuid === userArgs) {
          return -1; // put User to the top
        }
        if (b.uuid === userArgs) {
          return 1; // put User to the top
        }
        return 0; // don't change the other elements
      });

      if (match.match_type == 2) {
        match.score_changes.sort((a, b) => {
          if (a.uuid === userArgs) {
            return -1; // put User to the top
          }
          if (b.uuid === userArgs) {
            return 1; // put User to the top
          }
          return 0; // don't change the other elements
        });
      }

      break;
    case false:
      match.members.sort((a, b) => {
        if (a.nickname.toLowerCase() === userArgs.toLowerCase()) {
          return -1; // put User to the top
        }
        if (b.nickname.toLowerCase() === userArgs.toLowerCase()) {
          return 1; // put User to the top
        }
        return 0; // don't change the other elements
      });

      if (match.match_type == 2) {
        const first_member_uuid = match.members[0].uuid;
        match.score_changes.sort((a, b) => {
          if (a.uuid === first_member_uuid) {
            return -1; // put User to the top
          }
          if (b.uuid === first_member_uuid) {
            return 1; // put User to the top
          }
          return 0; // don't change the other elements
        });
      }
      break;
  }

  const user_avatar_url = `https://crafatar.com/avatars/${match.members[0].uuid}.png?overlay`;
  const user_username = match.members[0].nickname;
  const user_uuid = match.members[0].uuid;
  const user_curr_elo = match.members[0].elo_rate;
  const user_curr_rank = match.members[0].elo_rank;
  const match_id = match.match_id;

  const opponent_username = match.members[1].nickname;
  const opponent_uuid = match.members[1].uuid;
  const opponent_curr_elo = match.members[1].elo_rate;
  const opponent_curr_rank = match.members[1].elo_rank;

  const total_seconds = match.final_time / 1000;
  let minutes = Math.floor(total_seconds / 60)
    .toFixed()
    .toString();
  let seconds = (total_seconds % 60).toFixed().toString().padStart(2, "0");
  const match_duration = `${minutes}:${seconds}`;

  const match_date = new Date(match.match_date).getTime();

  let match_status;
  switch (match.winner) {
    case undefined || null:
      match_status = "The match was a draw";
      break;
    default:
      const winner_uuid = match.winner;
      const winner_object = match.members.find((member) => member.uuid === winner_uuid);
      const winner_nickname = winner_object.nickname;
      match_status = `\`${winner_nickname}\` won the match`;
      break;
  }

  let forfeit = "";
  if (match.forfeit) {
    forfeit = ` (forfeit)`;
    if (match.winner == null) {
      forfeit = "";
    }
  }

  let user_elo_change;
  let opponent_elo_change;
  if (match.match_type != 2) {
    user_elo_change = `**Elo change:** [\`<?>\`](https://mcsrranked.com "the question mark here indicates that there was no elo change because the match type isn't ranked")\n**Prev. elo:** [\`<?>\`](https://mcsrranked.com "the question mark here indicates that there was previos elo because the match isn't ranked")\n[User profile](https://disrespec.tech/elo/?username=${user_username})`;
    opponent_elo_change = `**Elo change:** [\`<?>\`](https://mcsrranked.com "the question mark here indicates that there was no elo change because the match type isn't ranked")\n**Prev. elo:** [\`<?>\`](https://mcsrranked.com "the question mark here indicates that there was previos elo because the match isn't ranked")\n[User profile](https://disrespec.tech/elo/?username=${opponent_username})`;
  } else {
    user_elo_change = `**Elo change:** \`${match.score_changes[0].change}\`\n**Prev. elo:** \`${match.score_changes[0].score}\``;
    opponent_elo_change = `**Elo change:** \`${match.score_changes[1].change}\`\n**Prev. elo:** \`${match.score_changes[1].score}\``;
  }

  let match_type;
  switch (match.match_type) {
    case 1:
      match_type = "Casual";
      break;
    case 2:
      match_type = "Ranked";
      break;
    case 3:
      match_type = "Private";
      break;
  }

  function addNumSuffix(num) {
    const suffixes = {
      1: "st",
      2: "nd",
      3: "rd",
      11: "th",
      12: "th",
      13: "th",
    };
    const lastTwoDigits = num % 100;
    const lastDigit = num % 10;
    const suffix = suffixes[lastTwoDigits] || suffixes[lastDigit] || "th";
    return num + suffix;
  }

  const embed = new EmbedBuilder()
    .setColor("Purple")
    .setTitle(`Match ID: ${match_id}`)
    .setAuthor({
      name: `${addNumSuffix(_index)} latest match`,
    })
    .setDescription(`**Match type: ${match_type}**\n**Match status: ${match_status}**\n**Match duration:** \`${match_duration}\`${forfeit}\n**Match date:** <t:${match_date}:R>`)
    .setFields(
      {
        name: "User",
        value: `**[${user_username}](https://disrespec.tech/elo/?username=${user_username}) - ${user_curr_elo} elo (#${user_curr_rank})**\n${user_elo_change}${user_uuid}`,
        inline: true,
      },
      {
        name: "\u200b",
        value: "\u200b<:versus:1092979181215817749>",
        inline: true,
      },
      {
        name: "Opponent",
        value: `**[${opponent_username}](https://disrespec.tech/elo/?username=${opponent_username}) - ${opponent_curr_elo} elo (#${opponent_curr_rank})**\n${opponent_elo_change}${opponent_uuid}`,
        inline: true,
      }
    )
    .setThumbnail(user_avatar_url)
    .setFooter({ text: `Stats by mcsrranked.com`, iconURL: "https://media.discordapp.net/attachments/1074302646883733554/1083683972661379122/icon_x512.png" });

  return embed;
}

module.exports = { getMatch };
