async function findID(searchValue, collection) {
  const users = await collection.findOne({});
  let userID = "";
  for (const key in users) {
    if (users[key].MinecraftUserID === searchValue) {
      userID = key;
      break;
    }
  }

  if (users[userID].discord === false) {
    return null;
  }
  return userID;
}

module.exports = { findID };
