const coal = "<:coal:1092904874791931965>";
const iron = "<:iron:1092904882584965230>";
const gold = "<:gold:1092904879749611678>";
const diamond = "<:diamond:1092904877744734288>";

const tierRanges = {
  "Coal 1": [0, 199],
  "Coal 2": [200, 399],
  "Coal 3": [400, 599],
  "Iron 1": [600, 799],
  "Iron 2": [800, 999],
  "Iron 3": [1000, 1199],
  "Gold 1": [1200, 1399],
  "Gold 2": [1400, 1599],
  "Gold 3": [1600, 1799],
  "Diamond 1": [1800, 1999],
  "Diamond 2": [2000, 2199],
  "Diamond 3": [2200, 2399],
};

function findTier(elo) {
  let _elo = elo;
  let tier = "Unknown";
  let nextTier = "Feinberg lookin ass";
  let eloNeeded = 0;

  for (const [key, value] of Object.entries(tierRanges)) {
    if (_elo >= value[0] && _elo <= value[1]) {
      tier = key;
      const nextTierIndex = Object.keys(tierRanges).indexOf(key) + 1;

      if (nextTierIndex < Object.keys(tierRanges).length) {
        nextTier = Object.keys(tierRanges)[nextTierIndex];
        eloNeeded = tierRanges[nextTier][0] - _elo;
      }
      break;
    }
  }

  const emotes = {
    coal: coal,
    iron: iron,
    gold: gold,
    diamond: diamond,
  };

  function tierToEmote(tier) {
    let _tier = tier.toLowerCase();
    for (const [key, value] of Object.entries(emotes)) {
      if (_tier.includes(key)) {
        return value;
      }
    }
    return null;
  }

  const emote = tierToEmote(tier);
  const nextEmote = tierToEmote(nextTier);
  return { currElo: _elo, tier: tier, nextTier: nextTier, eloNeeded: eloNeeded, emote: emote, nextEmote: nextEmote };
}

module.exports = { findTier };
