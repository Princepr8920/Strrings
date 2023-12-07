const createUniqueIndex = require("../service/createUniqueIndex");

let USER_SCHEMA = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "User Object Validation",
      required: [
        "username",
        "password",
        "first_name",
        "email",
        "last_seen",
        "joined_at",
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
        about: { bsonType: "string" },
        status: { bsonType: "string" },
        userID: { bsonType: "string" },
        provider: { bsonType: "string" },
        last_seen: { bsonType: "date" },
        joined_at: { bsonType: "date" },
        birthday: { bsonType: "date" },
        events: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              event_name: { bsonType: "string" },
              event_time: { bsonType: "date" },
              event_completed: { bsonType: "bool" },
              event_type: {
                enum: [
                  "Reminder",
                  "Wishes",
                  "Alert",
                  "Suggestion",
                  "Information",
                  "Others",
                ],
              },
              event_info: {
                bsonType: "object",
                properties: {
                  event_description: { bsonType: "string" },
                  event_highlights: { bsonType: "array" },
                },
              },
            },
          },
        },
        appearance: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            dark_mode: {
              enum: ["on", "off", "auto", "system_default"],
              description: "Must be either on , off, system_default or auto",
            },
            background: {
              bsonType: "object",
              additionalProperties: false,
              properties: {
                bg_type: {
                  enum: ["image", "solid_colour"],
                },
                current_bg: { bsonType: "string" },
                custom_bg: { bsonType: "bool" },
              },
            },
          },
        },
        notifications: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            notification_permission: {
              bsonType: "object",
              additionalProperties: false,
              properties: {
                permission: { bsonType: "bool" },
                token: { bsonType: "string" },
              },
            },
            message_notification: {
              bsonType: "bool",
              description: "Must be either true or false",
            },
          },
        },
        security: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            two_step_verification: { bsonType: "bool" },
            login_notification: { bsonType: "bool" },
          },
        },

        confirmationCode: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            code: { bsonType: "string" },
            for: { bsonType: "string" },
            resend: { bsonType: "bool" },
            issueAt: { bsonType: "date" },
            count: { bsonType: "number" },
          },
        },

        userRequests: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            emailRequest: {
              bsonType: "object",
              additionalProperties: false,
              properties: {
                requestedEmail: { bsonType: "string" },
                issueAt: { bsonType: "date" },
              },
            },
          },
        },

        verification: { bsonType: "bool" },

        tokens: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            requestsToken: { bsonType: "string" },
            signupToken: { bsonType: "string" },
            loginToken: { bsonType: "string" },
            securityToken: { bsonType: "string" },
            refreshToken: { bsonType: "string" },
            socketToken: { bsonType: "string" },
            emailVerificationToken: { bsonType: "string" },
          },
        },
        user_logs: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            email_logs: {
              bsonType: "array",
              items: {
                bsonType: "object",
                additionalProperties: false,
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
                additionalProperties: false,
                required: ["username", "update_count", "updated_on"],
                properties: {
                  username: { bsonType: "string" },
                  updated_on: { bsonType: "date" },
                  update_count: { bsonType: "int" },
                },
              },
            },
            visit_logs: {
              bsonType: "array",
              items: {
                bsonType: "object",
                additionalProperties: false,
                properties: {
                  visit_count: { bsonType: "int" },
                  time_spent: { bsonType: "string" },
                  visited_on: { bsonType: "date" },
                },
              },
            },
          },
        },

        feedback: {
          bsonType: "array",
          items: {
            bsonType: "object",
            additionalProperties: false,
            properties: {
              message: { bsonType: "string" },
              receivedAt: { bsonType: "date" },
            },
          },
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
};

async function setDefaultValues(info, client) {
  const { username, email } = info;
  await createUniqueIndex(client, {
    selectedDb: "Strrings",
    selectedCollection: "userCollection",
    uniqueness: { email: 1, username: 1, userID: 1 },
  });

  const objectWithDefaultValues = {
    ...info,
    about: "Information is not available.",
    status: "Available",
    provider: "local",
    picture: `${process.env.CLOUDFRONT_URL}/avatars/small/user_default_avatar.jpg`,
    last_seen: new Date(),
    joined_at: new Date(),
    security: {
      two_step_verification: false,
      login_notification: false,
    },
    confirmationCode: {},
    verification: false,
    userID: "",
    userRequests: {},
    events: [],
    user_logs: {
      email_logs: [{ email: email, updated_on: new Date(), update_count: 0 }],
      username_logs: [
        { username: username, updated_on: new Date(), update_count: 0 },
      ],
      visit_logs: [],
    },
    appearance: {
      dark_mode: "off",
      background: {
        bg_type: "solid_colour",
        current_bg: "white",
        custom_bg: false,
      },
    },
    notifications: {
      message_notification: false,
      notification_permission: {
        permission: false,
        token: "",
      },
    },
    feedback: [],
  };
  return objectWithDefaultValues;
}

module.exports = { setDefaultValues, USER_SCHEMA };
