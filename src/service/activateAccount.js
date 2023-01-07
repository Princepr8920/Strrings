const { updateUserData } = require("../database/database"),
  { v4: uuidv4 } = require("uuid");

module.exports = async function activateAccount(email) {
  const userID = uuidv4(),
    activate = await updateUserData(
      { email: email },
      { $set: { account_status: "Account Verified", userID: userID } }
    );
  return activate;
};
