const fs = require("fs");
async function findID(searchValue) {
  const data = JSON.parse(await fs.promises.readFile("./src/db/user-data.json"));
  const foundKey = Object.keys(data).find((key) => data[key].MinecraftUserID === searchValue);
  try {
    if (data[foundKey].discord == "true" || data[foundKey].discord == "1" || data[foundKey].discord == undefined) {
      return foundKey;
    }
  } catch (err) {
    return undefined;
  }
  return null;
}

module.exports = { findID };
