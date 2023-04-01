exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();

	message.channel.send(`Pong! 🏓`).then(async (msg) => {
		let time = msg.createdTimestamp - message.createdTimestamp;

		const start_time = Date.now();

		const ranked_base_URL = "https://mcsrranked.com/api";
		await fetch(`${ranked_base_URL}/users/${userArgs}`).then((res) => res.json());

		let ranked_time = Date.now() - start_time;

		msg.edit(`Pong! 🏓\n(Discord API latency: ${time}ms)\n(ranked API latency: ${ranked_time}ms)`);
	});
};
exports.name = "ping";
exports.aliases = ["ping"];
exports.description = ["Displays the bot's and osu! api's latency, also checks to see if the bot is active"];
exports.usage = [`ping`];
exports.category = ["general"];
