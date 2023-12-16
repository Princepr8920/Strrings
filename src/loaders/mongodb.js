const { MongoClient } = require("mongodb");
(uri = process.env.MONGO_DB_URL),
  (client = new MongoClient(uri, {
    useNewUrlParser: true, // Use the new parser (required for MongoDB >= 3.1)
    useUnifiedTopology: true, // Use the new Server and Engine
    retryWrites: true, // Retry write operations upon transient network errors
  })),
  ({ USER_SCHEMA } = require("../models/userSchema")),
  ({ CHAT_SCHEMA } = require("../models/chatSchema")),
  (connection = { isConnected: false });

async function connectToDatebase() {
  try {
    await client.connect();
    console.log(`Database connected successfully 💽`);
    connection.isConnected = true;
    const appCollections = [
      createCollectionWithSchema({
        collection: "userCollection",
        schema: USER_SCHEMA,
      }),
      createCollectionWithSchema({
        collection: "chatCollection",
        schema: CHAT_SCHEMA,
      }),
      createCollectionWithSchema({
        collection: "testCollection",
        schema: USER_SCHEMA,
      }),
    ];

    Promise.all(appCollections)
      .then((responses) => responses)
      .catch((error) => {
        console.error(error);
      });

    addNewProperty({
      collection: "chatCollection", //enter collection name to update schema
      modelObject: CHAT_SCHEMA, // enter schema to update
      modify: false, // change to true if we need to update schema
    });
  } catch (err) {
    connection.isConnected = false;
    console.error(err);
  }
}

async function createCollectionWithSchema(options) {
  let { collection, schema } = options;
  try {
    if (connection.isConnected) {
      if (schema && collection) {
        const collections = await client
            .db("Strrings")
            .listCollections()
            .toArray(),
          exisitingCollections = collections.map((e) => e.name);
        if (!exisitingCollections.includes(collection)) {
          // If db collection with schema are not created so this will create it🔌
          await client.db("Strrings").createCollection(collection, schema);
        }
      }
      return { collection, created: true };
    } else {
      throw new Error("Database not connected ❌");
    }
  } catch (error) {
    console.error(error);
  }
}

async function addNewProperty(options) {
  const { collection, modelObject, modify } = options;
  if (modify) {
    const DB = client.db("Strrings");
    DB.command(
      {
        collMod: collection,
        ...modelObject,
      },
      function (err, result) {
        if (err) throw err;
        return { ...result, isModified: true };
      }
    );
  }
  return { isModified: false };
}

function database(collection = "userCollection") {
  const db = client.db("Strrings").collection(collection);
  return db;
}

async function disconnectToDatabase() {
  await client.close();
  console.log("Database disconnected 🚫");
  return;
}

module.exports = {
  connectToDatebase,
  client,
  database,
  createCollectionWithSchema,
  disconnectToDatabase,
};
