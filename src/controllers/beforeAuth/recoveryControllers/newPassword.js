const { Update_Error } = require("../../../service/handleErrors"),
  passwordService = require("../../../service/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const setNewPassword = async (req, res, next) => {
  let token = req.cookies?.change_once;
  let { new_password } = req.body;

  try {
    let { success, message } = await SECURE_PASSWORD.setNewPassword(
      new_password,
      token
    );
    if (success) {
      res.clearCookie("change_once", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res.clearCookie("recovery_mode", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      await userDb.updateOne(
        { "tokens.requestToken": token },
        { $set: { "tokens.requestToken": "" } }
      );

      return res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } else {
      throw new Update_Error(message, 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = setNewPassword;
