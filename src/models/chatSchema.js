let CHAT_SCHEMA = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Chat Object Validation",
      required: ["username", "userID"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        userID: { bsonType: "string" },
        username: { bsonType: "string" },

        contacts: {
          bsonType: "array",
          items: { bsonType: "string" },
        },
        blocked_contacts: {
          bsonType: "array",
          items: { bsonType: "string" },
        },

        messages: {
          bsonType: "array",
          items: {
            bsonType: "object",
            additionalProperties: false,
            properties: {
              /*contactID ===  userID*/
              contactID: { bsonType: "string" },
              data: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  additionalProperties: false,
                  properties: {
                    sender: { bsonType: "string" },
                    receiver: { bsonType: "string" },
                    message: {
                      bsonType: "object",
                      additionalProperties: false,
                      properties: {
                        content: { bsonType: "string" },
                        contentType: { bsonType: "string" },
                        read: { bsonType: "bool" },
                        delivered: { bsonType: "bool" },
                        sent: { bsonType: "bool" },
                        timestamp: { bsonType: "date" },
                        messageID: { bsonType: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
};

module.exports = { CHAT_SCHEMA };
