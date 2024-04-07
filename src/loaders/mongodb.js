const { MongoClient } = require("mongodb"),
  uri = process.env.MONGO_DB_URL,
  client = new MongoClient(uri, {
    useNewUrlParser: true, // Use the new parser (required for MongoDB >= 3.1)
    useUnifiedTopology: true, // Use the new Server and Engine
    retryWrites: true, // Retry write operations upon transient network errors
  }),
  { USER_SCHEMA } = require("../models/userSchema"),
  { CHAT_SCHEMA } = require("../models/chatSchema"),
  connection = { isConnected: false };

async function connectToDatabase() {
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

    modifyCollectionModel({
      collection: "userCollection", //enter collection name to update schema
      modelObject: USER_SCHEMA, // enter schema to update
      modify: false, // change to true if we need to update schema
      removeOldProps: null
      /* 
      set an object like this {filter:{},propsToRemove:{property1:"",property2:""}} if we want to remove propeties from all documents
      set an object like this {filter:{userID:"87r67rkfhiywee7343"},propsToRemove:{property1:"",property2:""}} if we want to remove propeties from particular document
      */
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
      throw new Error("Database couldn't be connected ❌");
    }
  } catch (error) {
    console.error(error);
  }
}

async function modifyCollectionModel(options) {
  const { collection, modelObject, modify, removeOldProps } = options;
  let isPropsRemoved = false;

  if (removeOldProps) {
    let removedProps = await removePropFromCollection(
      collection,
      removeOldProps.filter,
      removeOldProps.propsToRemove
    );
    isPropsRemoved = removedProps.success;
  } else {
    isPropsRemoved = true;
  }

  if (isPropsRemoved && modify) {
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

async function removePropFromCollection(
  collection,
  filter = {},
  propsToRemove
) {
  try {
    if (!collection) {
      throw new Error("Properties couldn't be removed ❌");
    }
    await database(collection).updateMany(
      filter, // Filter to match all documents
      { $unset: propsToRemove } // Unset old properties
    );
  } catch (error) {
    console.error(error);
    return { error: error.message, success: false };
  }
}

async function disconnectToDatabase() {
  await client.close();
  console.log("Database disconnected 🚫");
  return;
}

module.exports = {
  connectToDatabase,
  client,
  database,
  createCollectionWithSchema,
  disconnectToDatabase,
};
