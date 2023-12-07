const { Verificaiton_Error } = require("../handleErrors"),
  jwt = require("jsonwebtoken"),
  { database } = require("../../loaders/mongodb"),
  userDb = database("userCollection");

async function verifySocketToken(token) {
  try {
    const aggregationPipeline = [
      {
        $match: { "tokens.socketToken": token }, // Match multiple users by their IDs
      },
      {
        $project: {
          _id: 0,
          username: 1,
          userID: 1,
          user_logs: 1,
        },
      },
    ];
    // we use aggrigation pipeline to filter out the useful fields
    const checkInDb = await userDb.aggregate(aggregationPipeline).toArray();

    if (checkInDb.length) {
      jwt.verify(token, process.env.JWT_SESSION_SECRET, (err) => {
        if (err) {
          throw new Verificaiton_Error(
            "Socket verification failed",
            401,
            false
          );
        }
      });
      let timestamp = new Date();
      let visitLogs = checkInDb[0]?.user_logs?.visit_logs;
      let visitCounter =
        checkInDb[0]?.user_logs?.visit_logs[visitLogs.length - 1]
          ?.visit_count || 0;
      /* we will use it for calculating 
      the user time that spent to use this app */
      return {
        userData: checkInDb[0],
        timestamp,
        visitCounter,
        success: true,
      };
    } else {
      throw new Verificaiton_Error("Socket verification failed", 401, false);
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = verifySocketToken;
