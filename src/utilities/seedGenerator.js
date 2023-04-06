const fs = require("fs");

async function getLeaderboard(n) {
	const res = await fetch("https://mcsrranked.com/api/leaderboard").then((res) => res.json());

	let seeds = [];
	let seedsTotal = [];

	// gets the top n number of players
	for (let i = 0; i < n; i++) {
		let user = res.data.users[i];
		console.log(`Getting match values of ${user.nickname}..`);
		let Matches = await fetch(`https://mcsrranked.com/api/users/${user.nickname}/matches?filter=2`).then((res) => res.json());
		const playerSeed = getPlayerMatches(Matches);
		seeds.push(playerSeed);
		seedsTotal.push(playerSeed);
	}

	// write the seeds into seeds.txt
	let content = "";
	for (let i in seeds) {
		const subSeeds = seeds[i]; // create a subSeeds array to get seeds for each player

		for (let j in subSeeds) {
			content += `${subSeeds[j]}\n`;
		}
	}

	let _content = content.split("\n"); // split content into arrays
	_content = [...new Set(_content)]; // remove duplicate seeds if there are any
	_content = _content.join("\n"); // join back arrays

	// write the seeds into seeds.txt
	fs.writeFile("./src/utilities/totalSeeds.txt", _content, function (err) {
		if (err) {
			console.error("Error writing file: ", err);
			return;
		}
		console.log("Operation complete.");
	});
}

function getPlayerMatches(m) {
	let seeds = [];
	for (let i in m.data) {
		const seed = m.data[i].match_seed;
		seeds.push(seed);
	}
	return seeds;
}

getLeaderboard(150).then(() => console.log("getting.."));
