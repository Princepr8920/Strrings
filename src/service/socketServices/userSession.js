const timeSpend = require("../../utils/timeSpent");
const { database } = require("../../loaders/mongodb"),
  userDb = database("userCollection");

async function updateChatSession(data) {
  try {
    let { visitCounter, timestamp, user } = data;
    let getTimeSpent = timeSpend(timestamp, new Date());

    if (parseInt(getTimeSpent.split(":")[1]) >= 1) {
      // Only save user session if time is greater then or equal to 1 minute
      visitCounter = visitCounter + 1;
      await userDb.updateOne(
        { userID: user?.userID },
        {
          $set: { last_seen: new Date() },
          $push: {
            "user_logs.visit_logs": {
              visit_count: visitCounter,
              time_spent: getTimeSpent,
              visited_on: timestamp,
            },
          },
        }
      );
    }

    return;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = updateChatSession;
