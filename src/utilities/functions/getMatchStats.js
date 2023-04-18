const { EmbedBuilder } = require("discord.js");
const Table = require("easy-table");

async function getMatchStats(match) {
  const user_username = match.members[0].nickname;
  const user_uuid = match.members[0].uuid;

  const opponent_username = match.members[1].nickname;
  const opponent_uuid = match.members[1].uuid;

  const timelines = getTimelines(match, user_uuid, opponent_uuid);
  const userTimes = timelines.userTimes;
  const opponentTimes = timelines.opponentTimes;

  const match_id = match.match_id;

  const total_seconds = match.final_time / 1000;
  let minutes = Math.floor(total_seconds / 60)
    .toFixed()
    .toString();
  let seconds = (total_seconds % 60).toFixed().toString().padStart(2, "0");
  const match_duration = `${minutes}:${seconds}`;

  const match_date = new Date(match.match_date).getTime();
  const match_type = match.category + "%";
  let seed_type = match.seed_type;
  seed_type = seed_type.replace("_", " ");

  const table = getTable(user_username, opponent_username, userTimes, opponentTimes);

  const embed = new EmbedBuilder()
    .setColor("Purple")
    .setTitle(`Match ID: ${match_id}`)
    .setDescription(`**Category: ${match_type}**\n**Seed type: ${seed_type}**\n**Match duration:** \`${match_duration}\`\n**Match date:** <t:${match_date}:R>`)
    .setFields({
      name: "Timelines",
      value: `\`\`\`${table}\`\`\``,
    })
    .setFooter({ text: `Stats by mcsrranked.com`, iconURL: "https://media.discordapp.net/attachments/1074302646883733554/1083683972661379122/icon_x512.png" });

  return embed;
}

function getTimelines(match, user_uuid, opponent_uuid) {
  const timelineRaw = match.timelines
    .filter((timeline) => ["story.enter_the_end", "end.kill_dragon", "story.follow_ender_eye", "projectelo.timeline.blind_travel", "nether.find_fortress", "nether.find_bastion", "story.enter_the_nether"].includes(timeline.timeline))
    .reverse();

  timelineRaw.sort((a, b) => {
    if (a.timeline === "nether.find_bastion" && b.timeline === "nether.find_fortress") {
      return -1; // a should come before b
    } else if (a.timeline === "nether.find_fortress" && b.timeline === "projectelo.timeline.blind_travel") {
      return -1; // a should come before b
    } else if (a.timeline === "projectelo.timeline.blind_travel" && b.timeline === "nether.find_fortress") {
      return 1; // a should come after b
    } else {
      return a.time - b.time; // sort by time otherwise
    }
  });

  const timelinesByUuid = [];
  timelineRaw.forEach((timeline) => {
    if (!timelinesByUuid[timeline.uuid]) {
      timelinesByUuid[timeline.uuid] = {
        uuid: timeline.uuid,
        timelines: [],
      };
    }
    timelinesByUuid[timeline.uuid].timelines.push(timeline);
  });
  const timelinesArray = Object.values(timelinesByUuid);

  const userTimeline = timelinesArray.find((tl) => tl.uuid === user_uuid);
  const opponentTimeline = timelinesArray.find((tl) => tl.uuid === opponent_uuid);

  const userTimes = userTimeline
    ? userTimeline.timelines.map((tl) => {
        const timeInMs = tl.time;
        const minutes = Math.floor(timeInMs / 60000);
        const seconds = ((timeInMs % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, "0")}`;
      })
    : [];
  const opponentTimes = opponentTimeline
    ? opponentTimeline.timelines.map((tl) => {
        const timeInMs = tl.time;
        const minutes = Math.floor(timeInMs / 60000);
        const seconds = ((timeInMs % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, "0")}`;
      })
    : [];
  return { opponentTimes, userTimes };
}

function getTable(user, opponent, userTimes, opponentTimes) {
  const t = new Table();

  const events = ["Entered the Nether", "Entered the Bastion", "Entered the Fortress", "First Blind", "Entered the Stronghold", "Entered the End", "Killed the Dragon"];

  t.cell("User", user);
  t.cell("Events", "");
  t.cell("Opponent", opponent);
  t.newRow();

  const maxLength = Math.max(userTimes.length, opponentTimes.length);

  for (let i = 0; i < maxLength; i++) {
    const userTime = userTimes[i] || "";
    const opponentTime = opponentTimes[i] || "";
    t.cell("User", userTime);
    t.cell("Events", events[i]);
    t.cell("Opponent", opponentTime);
    t.newRow();
  }

  return t.toString();
}

module.exports = { getMatchStats };
