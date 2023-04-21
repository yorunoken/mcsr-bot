const { EmbedBuilder } = require("discord.js");
const Table = require("easy-table");

async function getLeaderboard(data, page) {
  const player_per_page = 25;
  const start = (page - 1) * player_per_page;
  const end = start + player_per_page;

  const total_page = Math.ceil(data.users.length / player_per_page);
  if (page > total_page) {
    const embed = new EmbedBuilder().setColor("Purple").setDescription(`Please provide a page value not greater than ${total_page}`);
    return embed;
  }

  const users = data.users.slice(start, end);

  const season_time = `**Season ends in:** <t:${data.season_end_time}:R>`;

  const embed = new EmbedBuilder()
    .setTitle("Season 1")
    .setDescription(`${season_time}\`\`\`${getPlayers(users)}\`\`\``)
    .setFooter({ text: `Page ${page} of ${total_page}` });
  return embed;
}

const getPlayers = (users) => {
  const data_table = users.map((user) => ({ placement: user.elo_rank, nickname: user.nickname, elo: user.elo_rate }));

  t = new Table();
  data_table.forEach(function (Skills) {
    t.cell("#", Skills.placement);
    t.cell("nickname", Skills.nickname);
    t.cell("elo", Skills.elo);
    t.newRow();
  });

  return t.toString();
};

module.exports = { getLeaderboard };
