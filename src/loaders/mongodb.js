const { MongoClient } = require("mongodb");
const uri = process.env.DB_LOC_CONN   //HELLOAPP_DB;
const client = new MongoClient(uri);
const connection = { isConnected: false };
const { userModel } = require("../models/userSchema");

async function connectToDatebase() {
  try {
    await client.connect();
    console.log("Database connected successfully 🧠");
    connection.isConnected = true;
    await setDb({
      database: "HELLOAPP",
      collection: "userCollection",
      model: userModel,
    });
  } catch (err) {
    connection.isConnected = false;
    console.error(err);
  }
}

async function setDb(options) {
  let { database, collection, model } = options;
  let { isConnected } = connection;
  try {
    if (isConnected) {
      // setup this funcition or create own ODM
      if (model && collection) {
        const collections = await client
            .db(database || "HelloDb")
            .listCollections()
            .toArray(),
          collectionExists = collections.map((e) => e.name);
        !collectionExists.includes(collection) ? await model(client) : "";
      }
      return;
    } else {
      throw new Error("Database not connected ❌");
    }
  } catch (error) {
    console.error(error);
  }
}

async function disconnectToDatabase() {
  await client.close();
  return console.log("Database disconnected successfully 🚫");
}

module.exports = { connectToDatebase, client, setDb, disconnectToDatabase };
