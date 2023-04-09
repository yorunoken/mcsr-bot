const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
exports.run = async (client, message, args, prefix) => {
	await message.channel.sendTyping();

	const allowedKeys = ["discord"];
	const allowedValues = ["true", "false", "0", "1"];
	const callError = (err) => new EmbedBuilder().setColor("Red").setTitle("Error").setDescription(`${err}`);
	const callFinal = (values) => new EmbedBuilder().setTitle(`Settings changed`).setDescription(`Changed values:\n${values}`).setColor("Green");

	let argValues = {};
	for (const arg of args) {
		let [key, value] = arg.split("=");
		if (!allowedKeys.includes(key.toLowerCase())) {
			const errEmbed = callError(`Please make sure your key is one of the following:\n\`${allowedKeys.join("` `")}\``);
			return message.reply({ embeds: [errEmbed] });
		}
		if (!allowedValues.includes(value)) {
			const errEmbed = callError(`Please make sure your value is one of the following:\n\`${allowedValues.join("` `")}\``);
			return message.reply({ embeds: [errEmbed] });
		}

		if (!isNaN(key)) {
			continue;
		}
		key = key.toLowerCase(); // turn the key into lowercase
		if (!isNaN(value)) {
			value = value === "1" ? true : value === "0" ? false : value;
		}
		value = value.toLowerCase(); // turn the value into lowercase
		argValues[key] = value;
	}

	let changedValues = "";
	for (const [key, value] of Object.entries(argValues)) {
		await writeConfig(key, value);
		changedValues += `**${key}:** \`${value}\`\n`;
	}
	message.channel.send({ embeds: [callFinal(changedValues)] });

	async function writeConfig(c_n, c_v) {
		const data = JSON.parse(await fs.promises.readFile("./user-data.json"));
		data[message.author.id] = { ...data[message.author.id], [c_n]: c_v };
		await fs.promises.writeFile("./user-data.json", JSON.stringify(data, null, 2));
	}
};
exports.name = "config";
exports.aliases = ["config"];
exports.description = ["Change your configs!\n\n**Parameters**:\n`discord=true/false` change if people can view your discord account from the bot"];
exports.usage = [`config discord=false`];
exports.category = ["general"];
