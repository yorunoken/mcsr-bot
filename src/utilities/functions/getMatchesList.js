const { EmbedBuilder } = require("discord.js");

async function getMatchesList(matches, ENCRYPTED, userArgs, page) {
	const start = (page - 1) * 5 + 1;
	const end = page * 5;

	let numbers = [];
	for (i = start; i <= end; i++) {
		numbers.push(i);
	}
	const _1 = numbers[0] - 1;
	const _2 = numbers[1] - 1;
	const _3 = numbers[2] - 1;
	const _4 = numbers[3] - 1;
	const _5 = numbers[4] - 1;

	let match1 = "";
	let match2 = "";
	let match3 = "";
	let match4 = "";
	let match5 = "";

	if (matches[_1]) match1 = `${getMatchData(matches[_1], _1 + 1, ENCRYPTED, userArgs)}\n`;
	if (matches[_2]) match2 = `\n${getMatchData(matches[_2], _2 + 1, ENCRYPTED, userArgs)}\n`;
	if (matches[_3]) match3 = `\n${getMatchData(matches[_3], _3 + 1, ENCRYPTED, userArgs)}\n`;
	if (matches[_4]) match4 = `\n${getMatchData(matches[_4], _4 + 1, ENCRYPTED, userArgs)}\n`;
	if (matches[_5]) match5 = `\n${getMatchData(matches[_5], _5 + 1, ENCRYPTED, userArgs)}`;

	const embed = new EmbedBuilder().setColor("Purple").setDescription(`${match1}${match2}${match3}${match4}${match5}`);
	return embed;
}

function getMatchData(match, index, ENCRYPTED, userArgs) {
	if (match == undefined) {
		return undefined;
	}

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

	const versus = "<:versus:1092979181215817749>";

	const user_username = match.members[0].nickname;
	const user_curr_elo = match.members[0].elo_rate;
	const user_curr_rank = match.members[0].elo_rank;

	const opponent_username = match.members[1].nickname;
	const opponent_curr_elo = match.members[1].elo_rate;
	const opponent_curr_rank = match.members[1].elo_rank;

	const total_seconds = match.final_time / 1000;
	let minutes = Math.floor(total_seconds / 60)
		.toFixed()
		.toString();
	let seconds = (total_seconds % 60).toFixed().toString().padStart(2, "0");
	const match_duration = `${minutes}:${seconds}`;

	const match_seed = match.match_seed;
	const match_date = new Date(match.match_date).getTime();

	let forfeit = "";
	if (match.forfeit) {
		forfeit = ` (forfeit)`;
		if (match.winner == null) {
			forfeit = "";
		}
	}

	let match_status;
	switch (match.winner) {
		case undefined || null:
			match_status = "**The match was a draw**";
			break;
		default:
			const winner_uuid = match.winner;
			const winner_object = match.members.find((member) => member.uuid === winner_uuid);
			const winner_nickname = winner_object.nickname;
			match_status = `\`${winner_nickname}\` :trophy:${forfeit}`;
			break;
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

	const row1 = `**${index}.** \`${match_seed}\` - [${match_type}]\n`;
	const row2 = `**${user_username}** (**${user_curr_elo}**elo #**${user_curr_rank}**) ${versus} **${opponent_username}** (**${opponent_curr_elo}**elo #**${opponent_curr_rank}**)\n`;
	const row3 = `${match_status} - Lasted \`${match_duration}\` [<t:${match_date}:R>]`;

	return `${row1}${row2}${row3}`;
}

module.exports = { getMatchesList };
