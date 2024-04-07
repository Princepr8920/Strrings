const timeSpend = require("../../utils/timeSpent"),
  { database } = require("../../loaders/mongodb"),
  userDb = database("userCollection");

async function updateChatSession(user) {
  try {
    let { visitCounter, timestamp, userID } = user;
    let getTimeSpent = timeSpend(timestamp, new Date());

    if (parseInt(getTimeSpent.split(":")[1]) >= 1) {
      // Only save user session if time is greater then or equal to 1 minute
      visitCounter = visitCounter + 1;
      await userDb.updateOne(
        { userID },
        {
          $set: {
            last_seen: new Date(),
            "user_logs.visit_logs.visit_counter": visitCounter,
          },
          $push: {
            "user_logs.visit_logs.visits": {
              visit_count: visitCounter,
              time_spent: getTimeSpent,
              visited_on: timestamp,
            },
          },
        },
        { upsert: true }
      );
    }
    return;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = updateChatSession;
