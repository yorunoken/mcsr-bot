const { EmbedBuilder } = require("discord.js");
const { FindUserargs } = require("../../utils/findUserargs.js");
const { MCSR } = require("mcsr-api");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new MCSR();

	let server = "minecraft";

	var userArgs = await FindUserargs(message, args, server, prefix);
	if (userArgs == undefined) {
		message.channel.send({ embeds: [new EmbedBuilder().setDescription("Link your account")] });
		return;
	}
	if (userArgs.endsWith("!{ENCRYPTED}")) {
		userArgs = userArgs.replace(/!{ENCRYPTED}$/, "");
	}

	/**
	const mojang_base_URL = "https://api.mojang.com/users";
	const mojang_response = await fetch(`${mojang_base_URL}/profiles/minecraft/${userArgs}`).then((res) => res.json());
	const uuid = mojang_response.id; 
    */

	let data;
	try {
		data = await api.getUserStats(userArgs);
	} catch (err) {
		message.channel.send({ embeds: [new EmbedBuilder().setColor("Purple").setDescription(`${err}`)] });
		return;
	}

	const avatar_url = `https://mc-heads.net/avatar/${data.uuid}/100.png`;
	const username = data.nickname;
	let curr_elo = data.elo_rate;
	if (curr_elo == -1) {
		curr_elo = 0;
	}

	let curr_rank = data.elo_rank;
	if (curr_rank == null) {
		curr_rank = "-";
	}

	const total_plays = data.total_played.toLocaleString();
	const season_plays = data.season_played.toLocaleString();

	const highest_streak = data.highest_winstreak.toLocaleString();
	const curr_streak = data.current_winstreak.toLocaleString();

	const elo_best = data.best_elo_rate.toLocaleString();
	const elo_last_season = data.prev_elo_rate.toLocaleString();

	const total_seconds = data.best_record_time / 1000;
	let minutes = Math.floor(total_seconds / 60);
	let seconds = total_seconds % 60;
	let pb_time = `${minutes.toFixed()}:${seconds.toFixed()}`;
	if (data.best_record_time == 0) {
		pb_time = `None`;
	}

	const last_played_time = new Date(data.latest_time).getTime();

	const records = data.records;
	let combined_records = { win: 0, lose: 0, draw: 0 };

	for (const record of Object.values(records)) {
		combined_records.win += record.win;
		combined_records.lose += record.lose;
		combined_records.draw += record.draw;
	}
	const winrate = (combined_records.win / (combined_records.win + combined_records.draw + combined_records.lose)) * 100;

	const ranked = `**Ranked**\n**wins:** \`${data.records[2].win}\` **losses:** \`${data.records[2].lose}\` **draws:** \`${data.records[2].draw}\``;
	const casual = `**Casual**\n**wins:** \`${data.records[1].win}\` **losses:** \`${data.records[1].lose}\` **draws:** \`${data.records[1].draw}\``;

	const first_row = `**Personal best time:** \`${pb_time}\` • **Winrate:** \`${winrate.toFixed(2)}%\`\n`;
	const second_row = `**Highest winstreak:** \`${highest_streak}\` • **Current winstreak:** \`${curr_streak}\`\n`;
	const third_row = `**Best elo:** \`${elo_best}\` • **Elo last season:** \`${elo_last_season}\`\n`;
	const fourth_row = `**Total plays:** \`${total_plays}\` • **This season:** \`${season_plays}\`\n`;
	const fifth_row = `**Last played:** <t:${last_played_time}:R>`;
	const embed = new EmbedBuilder()
		.setColor("Purple")
		.setAuthor({
			name: `${username} - ${curr_elo}elo (#${curr_rank})`,
			url: `https://disrespec.tech/elo/?username=${username}`,
		})
		.setThumbnail(avatar_url)
		.setFields(
			{
				name: "Statistics :bar_chart:",
				value: `${first_row}${second_row}${third_row}${fourth_row}${fifth_row}`,
				inline: false,
			},
			{
				name: "Modes <:homi:1083167118385745980>",
				value: `${ranked}\n${casual}`,
			},
		)
		.setFooter({ text: `Stats by mcsrranked.com`, iconURL: "https://media.discordapp.net/attachments/1074302646883733554/1083683972661379122/icon_x512.png" });
	message.channel.send({ embeds: [embed] });
};
exports.name = "profile";
exports.aliases = ["profile", "mcsr", "mc", "minecraft"];
exports.description = ["get mcsr ranked user statistics\n[mcsr ranked website](https://mcsrranked.com/)\n[user profile website](https://disrespec.tech/elo/)"];
exports.usage = [`profile yorunoken\nmcsr feinberg`];
exports.category = ["minecraft"];
