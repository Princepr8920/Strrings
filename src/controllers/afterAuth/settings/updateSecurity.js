const { Update_Error } = require("../../../service/handleErrors"),
  passwordService = require("../../../service/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  filterInstance = require("../../../utils/filterInfo"),
  FILTER = new filterInstance(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const updateSecurity = async (req, res, next) => {
  const update = req.body,
    refreshToken = req?.cookies?.strrings_connect;

  try {
    let updatedInfo = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": refreshToken },
      { $set: { security: update } },
      {
        returnDocument: "after",
      }
    );

    if (updatedInfo.value) {
      const user = FILTER.filterInfo(updatedInfo.value);
      res.status(200).json({
        user,
        success: true,
        message: "Security updated successfully",
      });
    } else {
      throw new Update_Error("Security update failed !", 500);
    }
  } catch (err) {
    return next(err);
  }
};

const updatePassword = async (req, res, next) => {
  const update = req.body,
    refreshToken = req?.cookies?.strrings_connect;

  try {
    const isUser = await userDb.findOne({
      "tokens.refreshToken": refreshToken,
    });
    if (isUser) {
      const { new_password } = update;
      let newPasswordSuccess = await SECURE_PASSWORD.setNewPassword(
        new_password,
        isUser.userID
      );
      if (newPasswordSuccess.success) {
        res
          .status(200)
          .json({ success: true, message: newPasswordSuccess.message });
      } else {
        return next(newPasswordSuccess);
      }
    } else {
      throw new Update_Error("Password couldn't be updated !", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { updatePassword, updateSecurity };
