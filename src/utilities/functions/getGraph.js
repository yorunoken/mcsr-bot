const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Chart = require("chart.js");
const { Canvas } = require("skia-canvas");

async function getGraph(user, match_data) {
  const elo_history = getEloHistory(user, match_data); // gets elo history (last 50 matches only), will make it so it gets more later

  let _days = [];
  for (let i = elo_history.length; i > 0; i--) {
    _days.push(i);
  }

  const canvas = new Canvas(1000, 600);
  const ctx = canvas.getContext("2d");
  const plugin = {
    id: "custom_canvas_background_color",
    beforeDraw: (chart) => {
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#36393E";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  };

  var gradient = ctx.createLinearGradient(0, 0, 0, 450);
  gradient.addColorStop(0, "rgba(207, 107, 107, 0.35)");
  gradient.addColorStop(1, "rgba(207, 107, 107, 0.05)");

  new Chart(ctx, {
    type: "line",
    plugins: [plugin],
    data: {
      labels: _days,
      datasets: [
        // Elo
        {
          label: "Elo",
          backgroundColor: gradient,
          borderColor: "rgba(235, 124, 124)",
          fill: true,
          pointRadius: 0,
          tension: 0.3,
          data: elo_history,
          fill: "start",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "rgba(255,255,255)",
            font: {
              weight: "bold",
            },
          },
        },
      },
      scales: {
        // y
        y: {
          ticks: {
            color: "rgba(255,255,255)",
            font: {
              weight: "bold",
              size: 15,
            },
          },
          grid: {
            borderColor: "rgba(96, 201, 64, 0.5)",
            color: "rgba(96, 201, 64, 0.5)",
          },
          title: {
            display: true,
            text: "Elo",
            color: "rgba(255,255,255)",
            font: {
              weight: "bold",
              size: 18,
            },
          },
        },

        // x
        x: {
          ticks: {
            maxTicksLimit: 20,
            color: "rgba(255,255,255)",
            font: {
              weight: "bold",
              size: 12,
            },
          },
          title: {
            display: true,
            text: "Matches ago",
            color: "rgba(255,255,255)",
            font: {
              weight: "bold",
              size: 18,
            },
          },
        },
      },
    },
  });

  const avatar_url = `https://crafatar.com/avatars/${user.uuid}.png?overlay`;
  const username = user.nickname;
  let curr_elo = user.elo_rate;
  if (curr_elo == -1) {
    curr_elo = 0;
  }
  let curr_rank = user.elo_rank;
  if (curr_rank == null) {
    curr_rank = "-";
  }

  const attachment = new AttachmentBuilder(await canvas.toBuffer("png"), { name: "random.png" });
  const embed = new EmbedBuilder()
    .setColor("Purple")
    .setTitle(`Elo graph of ${username} (${curr_elo} elo #${curr_rank})`)
    .setDescription(`For full graph, visit [Desktop Folder's website](https://disrespec.tech/elo/?username=${username})`)
    .setThumbnail(avatar_url)
    .setImage("attachment://random.png");
  return { embed, attachment };
}

function getEloHistory(user, data) {
  let elo_history = [];
  for (let i = data.length - 1; i >= 0; i--) {
    let match = data[i];

    let _match = sortScoreChanges(user, match);

    let _elo = _match[0].score;
    if (_elo !== -1) {
      elo_history.push(_elo);
    }
  }
  elo_history.push(user.elo_rate); // this is to push user's current elo because it's not included
  return elo_history;
}

function sortScoreChanges(user, data) {
  const user_uuid = user.uuid;
  let _data = data.score_changes.sort((a, b) => {
    if (a.uuid === user_uuid) {
      return -1; // put User to the top
    }
    if (b.uuid === user_uuid) {
      return 1; // put User to the top
    }
    return 0; // don't change the other elements
  });
  return _data;
}

module.exports = { getGraph };
