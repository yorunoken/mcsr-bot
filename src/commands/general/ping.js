exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();

	message.channel.send(`Pong! 🏓`).then(async (msg) => {
		let time = msg.createdTimestamp - message.createdTimestamp;

		const profile_start_time = Date.now();
		const ranked_base_URL = "https://mcsrranked.com/api";
		await fetch(`${ranked_base_URL}/users/yorunoken`).then((res) => res.json());
		let profile_time = Date.now() - profile_start_time;

		const matches_start_time = Date.now();
		await fetch(`${ranked_base_URL}/users/yorunoken/matches`).then((res) => res.json());
		let matches_profile_time = Date.now() - matches_start_time;

		msg.edit(`Pong! 🏓\n(Discord API latency: ${time}ms)\n(ranked profile API latency: ${profile_time}ms)\n(ranked matches API latency: ${matches_profile_time}ms)`);
	});
};
exports.name = "ping";
exports.aliases = ["ping"];
exports.description = ["Displays the bot's and osu! api's latency, also checks to see if the bot is active"];
exports.usage = [`ping`];
exports.category = ["general"];
