const { updateUserData } = require("../database/database");

module.exports = async function logManager(user, update) {
  const updateKeys = Object.keys(update),
    logsArr = ["username_logs", "email_logs"],
    pushDataToDb = { $push: {} };

  for (let i = 0, len = updateKeys.length; i < len; i++) {
    for (let j = 0, len = logsArr.length; j < len; j++) {
      if (logsArr[j].includes(updateKeys[i])) {
        let counter = user.user_logs[logsArr[j]].length;
        pushDataToDb.$push[`user_logs.${logsArr[j]}`] = {
          [updateKeys[i]]: update[updateKeys[i]],
          updated_on: new Date(),
          update_count: counter++,
        };
      }
    }
  }

  const updatedLogs = await updateUserData(
    { userID: user.userID },
    pushDataToDb
  );

  return updatedLogs;
};
