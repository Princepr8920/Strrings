const localUser = require("../models/localModel");
const { Update_Error } = require("./handleErrors");
const passwordService = require("./passwordService");
const SECURE_PASSWORD = new passwordService();

//   i repeted code many time in this file becouse i later use mongodb
// driver then i can change this file

module.exports = async function updateUserInfo(info) {
  const { update, userID } = info;
  const user = await localUser.findOne({ userID });
  try {
    if (user) {
      if (update.hasOwnProperty("email")) {
        let counter = user.user_logs.email_logs.length;
        user.email = update.email;
        user.user_logs.email_logs.push({
          email: update.email,
          updated_on: new Date(),
          count: counter++,
        });
        await user.save();
        return {
          user:user,
          success: true,
          message: "Email updated successfully",
          status: 200,
        };
      } else if (update.hasOwnProperty("username")) {
        let counter = user.user_logs.username_logs.length;
        user.username = update.username;
        user.user_logs.username_logs.push({
          username: update.username,
          updated_on: new Date(),
          count: counter++,
        });
        await user.save();
        return {
           user,
          success: true,
          message: "Information updated successfully",
          status: 200,
        };
      } else if (update.hasOwnProperty("current_password")) {
        if (!update.hasOwnProperty("new_password")) {
          throw new Update_Error("Please enter your new password", 401);
        } else if (!update.hasOwnProperty("confirm_password")) {
          throw new Update_Error("Please confirm your new password", 401);
        } else {
          const { current_password, new_password, confirm_password } = update;
          const setPassword = await SECURE_PASSWORD.setNewPassword(
            { current_password, new_password, confirm_password },
            userID
          );
          return {
            user,
            success: setPassword.success,
            message: setPassword.message,
            status: setPassword.status,
          };
        }
      } else if (update.hasOwnProperty("security")) {
        for (let key in update.security) {
          user.security[key] = update.security[key];
          await user.save();
        }
        return {
           user,
          success: true,
          message: "Information updated successfully",
          status: 200,
        };
      } else {
        const updatedInfo = await localUser.findOneAndUpdate(userID, update, {
          new: true,
        });
        return {
          user: updatedInfo,
          success: true,
          message: "Information updated successfully",
          status: 200,
        };
      }
    } else {
      throw new Update_Error("User not found", 404);
    }
  } catch (error) { 
    console.error(error);
    return { status: error.status, message: error.message };
  }
};
