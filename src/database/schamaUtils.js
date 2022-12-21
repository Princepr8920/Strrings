async function createUserSchema(location, schema,validationLevel) {
  const types = [
    "object",
    "array",
    "string",
    "number",
    "boolean",
    "int",
    "date",
    "binData",
    "objectId",
    "regex",
    "timestamp",
    "Decimal",
    "minKey",
    "maxKey",
    "long",
    "double", 
  ];

  let baseStructure = {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        title: schemaName || collection,
        required: required,
        properties: {},
      },
    },
    validationLevel: validationLevel || "moderate",
  }

  

  // const { database, collection } = location;
  // await client.db(database).createCollection(collection, );
}

module.exports = createCollection;


 








// count: {
//   bsonType: "int",
// },
// log: {
//   bsonType: "array",
//   items: {
//     bsonType: "object",
//     required: ["duration", "description"],
//     properties: {
//       description: {
//         bsonType: "string",
//         description: "des must be a string and is required",
//       },
//       duration: {
//         bsonType: "number",
//         description: "duration must be a number and is required",
//       },
//       date: {
//         bsonType: "string",
//         description: "date must be a number and is required",
//       },
//     },
//   },
// },