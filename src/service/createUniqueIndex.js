/* This method is used to create unique indexes like _id object in db 
and It also helps to improve query performance */

async function createUniqueIndex(client, options) {
  try {
    let { selectedDb, selectedCollection, uniqueness } = options;
    let myDb = await client.db(selectedDb).collection(selectedCollection);
    await myDb.createIndex(uniqueness, { unique: true });
    return { success: true, message: "Unique fields created" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

module.exports = createUniqueIndex;
