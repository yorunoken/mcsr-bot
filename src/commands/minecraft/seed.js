const fs = require("fs");
const { ranked_api } = require("mcsr-ranked-api");
const { FindUserargs } = require("../../utilities/findUserargs.js");
const { EmbedBuilder } = require("discord.js");

exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();
	const api = new ranked_api();
	let server = "minecraft";

	var userArgs = await FindUserargs(message, args, server, prefix);

	if (userArgs.endsWith("!{ENCRYPTED}")) {
		userArgs = userArgs.replace(/!{ENCRYPTED}$/, "");
	}
	const user = await api.getUserStats(userArgs);

	const userData = JSON.parse(await fs.promises.readFile("./user_seeds.json"));

	if (Object.keys(userData).length === 0 || userData[message.author.id] === undefined) {
		userData[message.author.id] = { ...userData[message.author.id], seeds: [] };
		await fs.promises.writeFile("./user_seeds.json", JSON.stringify(userData, null, 2));
	}

	const data = JSON.parse(await fs.promises.readFile("./user_seeds.json"));
	const userSeeds = data[message.author.id].seeds;

	let seed;
	if (userSeeds.length == 0) {
		seed = getRandomSeed();
		sendSeedEmbed(seed, user);

		data[message.author.id] = { ...userData[message.author.id], seeds: [seed] };
		await fs.promises.writeFile("./user_seeds.json", JSON.stringify(data, null, 2));
		return;
	}

	let seedPicked = false;
	do {
		seed = getRandomSeed();
		if (userSeeds.some((_seed) => seed !== _seed)) {
			seedPicked = true;
		}
	} while (seedPicked == false);

	data[message.author.id] = { ...userData[message.author.id], seeds: [...userData[message.author.id].seeds, seed] };
	await fs.promises.writeFile("./user_seeds.json", JSON.stringify(data, null, 2));
	sendSeedEmbed(seed, user);

	function sendSeedEmbed(s, u) {
		const embed = new EmbedBuilder().setColor("Random").setTitle(`Seed for ${u.nickname}`).setDescription(`**${s}**`);
		message.channel.send({ embeds: [embed] });
	}

	function getRandomSeed() {
		const seeds = fs.readFileSync("./src/utilities/totalSeeds.txt", "utf-8");
		const seedsArray = seeds.split("\n");
		seedsArray.pop();
		let i = Math.floor(Math.random() * seedsArray.length);

		return seedsArray[i];
	}
};
exports.name = "seed";
exports.aliases = ["seed", "seedgenerator", "randomseed"];
exports.description = ["seed"];
exports.usage = [`seed`];
exports.category = ["minecraft"];
