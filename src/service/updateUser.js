const passwordService = require("./passwordService"),
  SECURE_PASSWORD = new passwordService(),
  logManager = require("../service/logManager"),
  { updateUserData } = require("../database/database"),
  filterInstance = require("../utils/filterInfo"),
  FILTER = new filterInstance();

module.exports = async function updateUserInfo(info) {
  const { update, user } = info;
  console.log(update, "thiss is update");
  let updatedInfo;
  if (update.hasOwnProperty("current_password")) {
    const { new_password } = update;
    let newPasswordSuccess = await SECURE_PASSWORD.setNewPassword(
      new_password,
      user.userID
    );
    if (newPasswordSuccess.success) {
      let doNotSave = ["current_password", "new_password", "confirm_password"];
      FILTER.filterInfo(update, doNotSave);
    } else {
      return newPasswordSuccess;
    }
  }

  if (update.hasOwnProperty("security")) {
    const securityOptions = update.security,
      setSecurity = { ...user.security, ...securityOptions };
    update.security = setSecurity;
  }

  if (Object.keys(update).length) {
    updatedInfo = await updateUserData(
      { userID: user.userID },
      { $set: update }
    );
    await logManager(user, update);
  }

  return {
    user: Object.keys(update).length ? updatedInfo : user,
    success: true,
    message: "Information updated successfully",
  };
};
