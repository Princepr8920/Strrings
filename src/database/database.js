const { client } = require("../loaders/mongodb");
const db = client.db("HELLOAPP").collection("userCollection");

function checkFalsyValue(value) {
  let arr = [];
  if (Array.isArray(value)) {
    arr = value.map((e) => Object.values(e)[0]);
  } else {
    arr = Object.values(value);
  }
  const isTrue = arr.every((e) => e === "" || e === undefined);
  return isTrue ? { _id: null } : value;
}

async function saveToDatabase(data) {
  const insert = await db.insertOne(data);
  return insert;
}

async function findOneUser(query, operator = "") {
  const legalValue = checkFalsyValue(query);
  if (Array.isArray(legalValue) && operator !== "") {
    const user = await db.findOne({
      [operator]: legalValue,
    });
    return user;
  } else {
    const user = await db.findOne(legalValue);
    return user;
  }
}

async function updateUserData(query, update,operator) {
  const legalValue = checkFalsyValue(query);
  if (Array.isArray(legalValue) && operator !== "") {
    const user = await db.findOneAndUpdate(
      {
        [operator]: legalValue,
      },
      update
    );
    return user;
  } else {
    const user = await db.findOneAndUpdate(legalValue, update, {
      returnDocument: "after",
    });
    return user.value;
  }
}

async function deleteUserData(query) {
  const legalValue = checkFalsyValue(query);
  const user = await db.deleteOne(legalValue);
  return user;
}

async function findAll() {
  const user = await db.find().toArray();
  return user;
}

module.exports = {
  findAll,
  saveToDatabase,
  findOneUser,
  updateUserData,
  deleteUserData,
};
