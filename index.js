const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember],
});
require("dotenv/config");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const token = process.env.TOKEN;

client.slashcommands = new Collection();
client.commandaliases = new Collection();

const rest = new REST({ version: "10" }).setToken(token);

// slash command handler
const slashcommands = [];

const slashFolders = fs.readdirSync("./src/commands");
for (const folder of slashFolders) {
  const commandFiles = fs.readdirSync(`./src/commands/${folder}`);

  for (const file of commandFiles) {
    const command = require(`./src/commands/${folder}/${file}`);
    slashcommands.push(command.data.toJSON());
    client.slashcommands.set(command.data.name, command);
  }
}

client.on("ready", async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: slashcommands });
    console.log(`logged in as ${client.user.tag}`);
  } catch (error) {
    console.error(error);
  }
});

async function events() {
  const client = await MongoClient.connect(process.env.MONGO);
  console.log("Successfully connected to MongoDB!");
  return client.db("rankedBot");
}

events().then((database) => {
  // event handler
  fs.readdirSync("./src/events").forEach(async (file) => {
    const event = await require(`./src/events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, database));
  });
});

// nodejs events
process.on("unhandledRejection", (e) => {
  console.log(e);
});
process.on("uncaughtException", (e) => {
  console.log(e);
});
process.on("uncaughtExceptionMonitor", (e) => {
  console.log(e);
});

client.login(token);
