async function userModel(client) {
  await client.db("HELLOAPP").createCollection("userCollection", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        title: "user Object Validation",
        required: [
          "username",
          "password",
          "first_name",
          "email",
          "last_Visited",
          "joined_At",
        ],
        additionalProperties: false,
        properties: {
          _id: { bsonType: "objectId" },
          username: {
            bsonType: "string",
            minLength: 3,
            description: "'username' must be a string and is required",
          },
          first_name: {
            bsonType: "string",
            description: "'first_name' must be a string and is required",
          },
          last_name: {
            bsonType: "string",
            maxLength: 30,
            description: "'last_name' must be a string and is required",
          },
          password: {
            bsonType: "string",
            description: "'password' must be a string and is required",
            minLength: 8,
          },
          email: {
            bsonType: "string",
            description: "'email' must be a string and is required",
          },
          picture: { bsonType: "string" },
          bio: { bsonType: "string" },
          status: { bsonType: "string" },
          userID: { bsonType: "string" },
          provider: { bsonType: "string" },
          last_Visited: { bsonType: "date" },
          joined_At: { bsonType: "date" },
          date_of_birth: { bsonType: "date" },
          securityToken: { bsonType: "string" },
          refreshToken: { bsonType: "string" },

          preferences: {
            bsonType: "object",
            items: {
              bsonType: "object",
              properties: {
                dark_mode: {
                  enum: ["on", "off", "auto"],
                  description: "Must be either on , off, or auto",
                },
                theme: { bsonType: "string" },
              },
            },
          },

          security: {
            bsonType: "object",
            items: {
              bsonType: "object",
              properties: {
                two_step_verification: { bsonType: "bool" },
                login_notification: { bsonType: "bool" },
              },
            },
          },

          confirmationCode: {
            bsonType: "array",
            items: {
              bsonType: "object",
              properties: {
                otp: { bsonType: "string" },
                for: { bsonType: "string" },
                resend: { bsonType: "bool" },
                issueAt: { bsonType: "date" },
              },
            },
          },

          userRequests: {
            bsonType: "object",
            items: {
              bsonType: "object",
              properties: {
                emailRequests: {
                  bsonType: "array",
                  items: {
                    bsonType: "object",
                    properties: {
                      requestedEmail: { bsonType: "string" },
                      issueAt: { bsonType: "date" },
                    },
                  },
                },
                // accountRequests: {
                //   bsonType: "array",
                //   items: {
                //     bsonType: "object",
                //     properties: {
                //       requestedEmail: { bsonType: "string" },
                //       issueAt: { bsonType: "date" },
                //     },
                //   },
                // },
              },
            },
          },

          account_status: { bsonType: "string" },

          requestsToken: { bsonType: "string" },

          user_logs: {
            bsonType: "object",
            items: {
              bsonType: "object",
              properties: {
                email_logs: {
                  bsonType: "array",
                  items: {
                    bsonType: "object",
                    required: ["email", "update_count", "updated_on"],
                    properties: {
                      email: { bsonType: "string" },
                      updated_on: { bsonType: "date" },
                      update_count: { bsonType: "int" },
                    },
                  },
                },
                username_logs: {
                  bsonType: "array",
                  items: {
                    bsonType: "object",
                    required: ["username", "update_count", "updated_on"],
                    properties: {
                      username: { bsonType: "string" },
                      updated_on: { bsonType: "date" },
                      update_count: { bsonType: "int" },
                    },
                  },
                },
                // password_logs: {
                //   bsonType: "array",
                //   items: {
                //     bsonType: "object",
                //     required: ["password", "update_count", "updated_on"],
                //     properties: {
                //       password: { bsonType: "string" },
                //       updated_on: { bsonType: "date" },
                //       update_count: { bsonType: "int" },
                //     },
                //   },
                // },
                visit_logs: {
                  bsonType: "array",
                  items: {
                    bsonType: "object",
                    required: ["visited_on", "visited_count", "time_spent"],
                    properties: {
                      visited_count: { bsonType: "int" },
                      time_spent: { bsonType: "string" },
                      visited_on: { bsonType: "date" },
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
  });

  createUniqueIndex(client, ["email", "username","userID"]);
  return;
}

async function createUniqueIndex(client, properties) {
  for (let i = 0, len = properties.length; i < len; i++) {
    await client
      .db("HELLOAPP")
      .collection("userCollection")
      .createIndex({ [properties[i]]: 1 }, { unique: true });
  }
  return;
}

async function setDefaultValues(info) {
  const { username, email } = info;

  const objectWithDefaultValues = {
    ...info,
    picture:
      "https://images.unsplash.com/photo-1531214159280-079b95d26139?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    bio: "bio not avilable",
    status: "none",
    provider: "local",
    last_Visited: new Date(),
    joined_At: new Date(),
    date_of_birth: new Date(),
    preferences: {
      dark_mode: false,
    },
    security: {
      two_step_verification: false,
      login_notification: false,
    },
    confirmationCode: [],
    account_status: "Account verification pending",
    userID:"",
    userRequests: { emailRequests: [] },
    user_logs: {
      email_logs: [{ email: email, updated_on: new Date(), update_count: 0 }],
      username_logs: [
        { username: username, updated_on: new Date(), update_count: 0 },
      ],
      visit_logs: [],
    },
    preferences: {
      dark_mode: "off",
      theme: "default",
    },
  };
  return objectWithDefaultValues;
}

module.exports = { userModel, setDefaultValues };
