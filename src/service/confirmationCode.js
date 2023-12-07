const { sendConfirmationEmail } = require("../service/mailer"),
  { Verificaiton_Error, Service_Error } = require("../service/handleErrors"),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection");

module.exports = class VerifyUser {
  #RandomDigit() {
    const digit = 2830976514,
      code = Math.floor(Math.random() * digit).toString(),
      onlySix = code.split("").slice(0, 6).join("");
    return onlySix;
  }

  async sendEmail(options) {
    const { userID, email, type, resend } = options;
    const confirmationCode = this.#RandomDigit();
    const getUser = await userDb.findOne({
      $or: [{ email: email }, { userID: userID }],
    });

    const userEmail = getUser?.email;

    try {
      let isEmailSent = await sendConfirmationEmail({
        username: getUser?.username,
        email,
        type,
        secret: confirmationCode,
      });

      if (isEmailSent?.success && getUser) {
        let counter = 0;
        if (resend) {
          // if resend is true so increment in counter
          counter = getUser?.confirmationCode?.count + 1;
        }

        await userDb.updateOne(
          { email: userEmail },
          {
            $set: {
              confirmationCode: {
                code: confirmationCode,
                for: type,
                issueAt: new Date(),
                resend: resend,
                count: counter,
              },
            },
          }
        );
        return {
          success: true,
          message: "Code sent.",
        };
      } else {
        throw new Verificaiton_Error("Verification email not sent !", 500);
      }
    } catch (error) {
      return error;
    }
  }

  async sendResetPasswordLink(info) {
    const { username, email, link } = info;

    let getUser = await userDb.findOne({
      $or: [{ email }, { username }],
    });

    try {
      const isEmailSent = await sendConfirmationEmail({
        username,
        email,
        type: "reset",
        secret: link,
      });
      if (isEmailSent.success && getUser) {
        return {
          success: true,
          message:
            "Password reset link has been sent to your registered email address.",
        };
      } else {
        throw new Verificaiton_Error("Couldn't send reset password link.", 500);
      }
    } catch (error) {
      return error;
    }
  }

  async VerifyConfirmationCode(code, expire, user) {
    let issuedTime = new Date(user?.confirmationCode?.issueAt).getTime();
    let now = new Date().getTime();
    let isExpire = now - issuedTime;

    try {
      if (user && user?.confirmationCode?.code === code) {
        if (isExpire >= expire) {
          throw new Verificaiton_Error("invalid verification code", 401, false);
        } else {
          let updatedUser = await userDb.findOneAndUpdate(
            { email: user.email },
            { $set: { confirmationCode: {} } },
            {
              returnDocument: "after",
            }
          );

          if (!updatedUser.value) {
            throw new Verificaiton_Error("Something went wrong", 500, false);
          }

          return {
            userProfile: updatedUser.value,
            success: true,
            message: "Verified succcessfully",
          };
        }
      } else {
        throw new Verificaiton_Error("invalid verification code", 401, false);
      }
    } catch (error) {
      return error;
    }
  }

  async resendVerificationEmail(options) {
    let { type, pass } = options;
    // type = type of verification and pass = token name with token
    let user = await userDb.findOne({ [`tokens.${pass[0]}`]: pass[1] });
    let forUnverifiedUser = type === "verify_Account";
    let forVerifiedUser = ["verify_Email", "two_step_verification"].includes(
      type
    );

    try {
      if (
        user &&
        user.confirmationCode.hasOwnProperty("code") &&
        user.confirmationCode.count < 3 &&
        (forVerifiedUser || forUnverifiedUser)
        // There are two iF conditions first is check if user exist and the user have previous confirmation code AND
        // second is to check if there is new user and he/she want to verify their account
      ) {
        let issuedTime = new Date(user?.confirmationCode?.issueAt).getTime(),
          resend = user?.confirmationCode?.resend,
          now = new Date().getTime();
        let address = user.email;

        if (
          type === "verify_Email" &&
          user?.userRequests?.emailRequest?.requestedEmail
        ) {
          // If user want to change their email so we send the verification code to new email address
          address = user.userRequests.emailRequest.requestedEmail;
        }

        if (now - issuedTime > 30000 || !resend) {
          const emailSuccess = await this.sendEmail({
            userID: user.userID,
            email: address,
            type,
            resend: true,
          });

          if (!emailSuccess.success) {
            return emailSuccess;
          }

          const wait = new Date().getTime() + 30000;
          return { ...emailSuccess, time: +wait, status: 200 };
        } else {
          return {
            success: false,
            message: "Verification code resend in 30 seconds.",
            status: 202,
          };
        }
      } else if (
        user &&
        user.confirmationCode.hasOwnProperty("code") &&
        user.confirmationCode.count === 3
      ) {
        // If user attempts 3 times to resend verificaiton code
        throw new Verificaiton_Error(
          "A new code can’t be sent at this time. Enter the last code you received or try again later.",
          400
        );
      } else {
        throw new Verificaiton_Error("Bad request", 400);
      }
    } catch (error) {
      return error;
    }
  }

  async feedback(info) {
    const { username, email, message } = info;

    try {
      const isEmailSent = await sendConfirmationEmail({
        username,
        email,
        type: "feedback",
        message,
      });
      if (isEmailSent.success) {
        return {
          success: true,
          message: "Message sent successfully.",
        };
      } else {
        throw new Service_Error("Message couldn't be sent", 500);
      }
    } catch (error) {
      return error;
    }
  }

  async login_notification(info) {
    const { username, email, secret } = info;

    try {
      const isEmailSent = await sendConfirmationEmail({
        username,
        email,
        type: "login_notification",
        secret,
      });

      if (isEmailSent.success) {
        return {
          success: true,
          message: "Login notification sent!",
        };
      } else {
        throw new Verificaiton_Error(
          "Login notification couldn't be sent",
          500
        );
      }
    } catch (error) {
      return error;
    }
  }

  async twoStepVerification(user) {
    const { username, email } = user;
    const secret = this.#RandomDigit();

    try {
      const isEmailSent = await sendConfirmationEmail({
        username,
        email,
        secret,
        type: "two_step_verification",
      });

      if (isEmailSent?.success) {
        await userDb.updateOne(
          { email },
          {
            $set: {
              confirmationCode: {
                code: secret,
                for: "two_step_verification",
                issueAt: new Date(),
                resend: false,
                count: 0,
              },
            },
          }
        );
        return {
          success: true,
          message: "Code sent.",
          twoStepVerification: true,
          email,
        };
      } else {
        throw new Verificaiton_Error("Couldn't send a verification code.", 500);
      }
    } catch (error) {
      return error;
    }
  }
};
