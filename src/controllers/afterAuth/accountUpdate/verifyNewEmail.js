const emailSender = require("../../../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  { Validation_Error, Update_Error } = require("../../../service/handleErrors");

const verifyUserEmail = async (req, res, next) => {
  const { strrings_connect, verify_email } = req.cookies;
  const { code } = req.body,
    user = await userDb.findOne({ "tokens.refreshToken": strrings_connect });

  try {
    if (user && code) {
      const expire = 10 * 60 * 1000;
      const { success, status, message } =
        await sendNewEmail.VerifyConfirmationCode(code, expire, user);

      if (success) {
        let counter = user.user_logs.email_logs.length;
        let updatedUser = await userDb.findOneAndUpdate(
          { userID: user.userID },
          {
            $set: {
              email: user?.userRequests.emailRequest.requestedEmail,
              "tokens.emailVerificationToken": "",
              "userRequests.emailRequest": {}, //Remove request from Db email request object
            },
            $push: {
              "user_logs.email_logs": {
                // update email logs
                email: user?.userRequests.emailRequest.requestedEmail,
                updated_on: new Date(),
                update_count: counter++,
              },
            },
          },
          {
            returnDocument: "after",
          }
        );

        if (updatedUser.value) {
          res.clearCookie("verify_email", verify_email, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          return res.status(200).json({
            success: true,
            message: "Email updated successfully",
          });
        } else {
          throw new Update_Error("Something went wrong!", 500);
        }
      } else {
        return res.status(status).json({ success, status, message });
      }
    } else {
      throw new Validation_Error("Something went wrong!", 500);
    }
  } catch (error) {
    return next(error);
  }
};

const resendVerificaiton = async (req, res) => {
  const token = req.cookies.verify_email;
  const isEmailSent = await sendNewEmail.resendVerificationEmail({
    type: "verify_Email",
    pass: ["emailVerificationToken", token],
  });
  return res.status(isEmailSent.status).json(isEmailSent);
};

module.exports = { verifyUserEmail, resendVerificaiton };
