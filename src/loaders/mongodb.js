// const { MongoClient } = require("mongodb");
// const uri = process.env.MY_DB;
// const client = new MongoClient(uri);
// const connection = { isConnected: false };

// async function connectToDatebase() {
//   try {
//     await client.connect();
//     console.log("HelloApp database connected successfully 🧠");
//     connection.isConnected = true;
//   } catch (e) {
//     connection.isConnected = false;
//     console.error(e);
//   }
// }

// async function setDb(options) {
//   let { database, collection ,modelName,collectionName} =  options;
//   let { isConnected } = connection;
//   try {
//     if (isConnected) {
//       const db = await {
//         db: client.db(database || "HelloDb"),
//         dbc: client.db(database || "HelloDb").collection(collection || "userCollection"),
//       };

// // setup this funcition cleanly or craeate own ODM 

//       if(modelName && collectionName){
//       const collections = await client.db(database || "HelloDb").listCollections().toArray(),
//       collectionExists = collections.map((e) => e.name);
//     !collectionExists.includes(collectionName)
//       ? await modelName()
//       : "";}
//       return db;
//     } else {
//       throw new Error("Database not connected ❌");
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

// async function disconnectToDatabase() {
//   await client.close();
//   return console.log("Database disconnected successfully 🚫")
// }

// module.exports = { connectToDatebase, setDb, disconnectToDatabase };
