/**
  this bot belongs to the discord user yoru#9267
  hope you enjoy!
 */

//requirements
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv/config");

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences],
});

// check if nessecary folders exist

console.log("checking for files..");
if (!fs.existsSync("user-data.json")) {
	console.log("user-data.json not found, creating file..");
	fs.writeFile("user-data.json", "{}", (err) => {
		console.log("user-data.json has been created!");
	});
} else console.log("user-data.json ✔");
if (!fs.existsSync("prefixes.json")) {
	console.log("prefixes.json not found, creating file..");
	fs.writeFile("prefixes.json", "{}", (err) => {
		console.log("prefixes.json has been created!");
	});
} else console.log("prefixes.json ✔");

// command handler
client.commands = new Map();
const commands = {};
const commandFolders = fs.readdirSync("src/commands");
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

	for (const file of commandFiles) {
		const commandFile = require(`./commands/${folder}/${file}`);
		commands[commandFile.name] = {
			file: file,
			description: commandFile.description,
			category: commandFile.category,
			aliases: commandFile.aliases,
			usage: commandFile.usage,
		};
		module.exports = commands;

		client.commands.set(commandFile.name, commandFile);

		if (commandFile.aliases) {
			commandFile.aliases.forEach((alias) => {
				client.commands.set(alias, commandFile);
			});
		}
	}
}

// user cooldown checker
const cooldowns = new Map();

client.on("ready", async () => {
	console.log(`bot on`);
	console.log(`Servers list:`);
	client.guilds.cache.forEach((guild) => {
		console.log(`${guild.name}`);
	});
	client.user.setPresence({
		activities: [{ name: `?help`, type: ActivityType.Playing }],
		status: "online",
	});
});

client.on("guildCreate", (guild) => {
	const guilds = guild.channels.cache.find((g) => g.type === 0);
	/**
	guilds.send(
		`Hello, I'm Mcsr-bot and thank you for inviting me! I am a minecraft bot created by yoru#9267. my default prefix is \`?\`. To start using the bot, you can set your osu! username by doing \`?link "your username"\`. to get a full list of all of the commands I have, please do \`?help\`, and to search for what specific commands do, do \`?help commandname\`. hope you enjoy! `,
	);
	*/
});

client.on("messageCreate", (message) => {
	//load the prefixes for each guild
	let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
	let prefix = prefixes[message.guild.id] ?? "?";

	//respond with bot's prefix if bot is tagged
	if (message.content === `<@${client.user.id}>`) return message.reply(`my prefix is **${prefix}**`);

	//detect whether or not a command was executed
	if (message.content.startsWith(prefix)) {
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName);
		if (!command) return;

		// check if the user is still in cooldown period
		const cooldownAmount = (command.cooldown || 2) * 1000;
		const userID = message.author.id;
		const key = `${userID}-${commandName}`;
		if (cooldowns.has(key)) {
			const expirationTime = cooldowns.get(key) + cooldownAmount;
			if (Date.now() < expirationTime) {
				const timeLeft = (expirationTime - Date.now()) / 1000;
				message.reply(`**You're on cooldown, please wait ${timeLeft.toFixed(1)} more seconds and try again.**`);
				return;
			}
		}

		// execute the command
		command.run(client, message, args, prefix, EmbedBuilder);

		// setting the cooldown
		cooldowns.set(key, Date.now());
		setTimeout(() => cooldowns.delete(key), cooldownAmount);
	}
});

client.login(process.env.TOKEN);
