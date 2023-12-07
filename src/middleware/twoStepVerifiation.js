const { Verificaiton_Error } = require("../service/handleErrors"),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection"),
  emailSender = require("../service/confirmationCode"),
  sendNewEmail = new emailSender();

async function twoStepVerification(req, res, next) {
  const { code } = req.body;
  const secureLogin = req.cookies.secure_login;

  try {
    if (secureLogin && code) {
      const user = await userDb.findOne({ "tokens.loginToken": secureLogin });
      const verifiedUser = await sendNewEmail.VerifyConfirmationCode(
        code,
        30 * 60 * 1000,
        user
      );

      if (user) {
        if (verifiedUser?.success) {
          res.clearCookie("secure_login", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          req.user = user; /// we set the req.user = user only for testing
          return next();
        } else {
          return next(verifiedUser); // Used for handle error ❌
        }
      }
    } else {
      throw new Verificaiton_Error("Bad request", 400);
    }
  } catch (error) {
    return next(error);
  }
}
module.exports = twoStepVerification;
