const { ranks } = require("./ranks.js");
const tierRanges = {
  "Coal 1": [0, 399],
  "Coal 2": [400, 499],
  "Coal 3": [500, 599],
  "Iron 1": [600, 699],
  "Iron 2": [700, 799],
  "Iron 3": [800, 899],
  "Gold 1": [900, 999],
  "Gold 2": [1000, 1099],
  "Gold 3": [1100, 1199],
  "Emerald 1": [1200, 1299],
  "Emerald 2": [1300, 1399],
  "Emerald 3": [1400, 1499],
  "Diamond 1": [1500, 1649],
  "Diamond 2": [1650, 1799],
  "Diamond 3": [1800, 1999],
  Netherite: [2000, Infinity],
};

function findTier(elo) {
  let currElo = elo;
  let tier = "Unrated";
  let nextTier = "Coal 1";
  let eloNeeded = 0;

  for (const [key, value] of Object.entries(tierRanges)) {
    if (elo === 0) break;
    if (currElo >= value[0] && currElo <= value[1]) {
      tier = key;
      const nextTierIndex = Object.keys(tierRanges).indexOf(key) + 1;

      if (nextTierIndex < Object.keys(tierRanges).length) {
        nextTier = Object.keys(tierRanges)[nextTierIndex];
        eloNeeded = tierRanges[nextTier][0] - currElo;
      }
      break;
    }
  }

  function tierToEmote(tier) {
    let _tier = tier.toLowerCase();
    for (const [key, value] of Object.entries(ranks)) {
      if (_tier.includes(key)) {
        return value;
      }
    }
    return null;
  }

  const emote = tierToEmote(tier) ?? ranks.unknown;
  const nextEmote = tierToEmote(nextTier);
  return { currElo, tier, nextTier, eloNeeded, emote, nextEmote };
}

module.exports = { findTier };
