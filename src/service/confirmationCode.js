const { sendConfirmationEmail } = require("../service/mailer"),
  { Verificaiton_Error } = require("../service/handleErrors");

const { updateUserData, findOneUser } = require("../database/database");

module.exports = class VerifyUser {
  #RandomDigit() {
    const digit = 2830976514,
      code = Math.floor(Math.random() * digit).toString(),
      onlySix = code.split("").slice(0, 6).join("");
    return onlySix;
  }

  async sendEmail(userID, email, task, resend) {
    const confirmationCode = this.#RandomDigit();
    const getUser = await findOneUser(
      [{ email: email }, { userID: userID }],
      "$or"
    );
    const userEmail = getUser?.email;

    try {
      let isEmailSent =
        task === "Account verification"
          ? await sendConfirmationEmail(
              getUser?.username,
              email,
              "verify_Account",
              confirmationCode
            )
          : await sendConfirmationEmail(
              "",
              email,
              "verify_Email",
              confirmationCode
            );

      if (isEmailSent.success && getUser) {
        if (getUser?.confirmationCode.length > 0) {
          await updateUserData(
            { email: userEmail },
            { $pop: { confirmationCode: -1 } }
          );
        }

        await updateUserData(
          { email: userEmail },
          {
            $push: {
              confirmationCode: {
                otp: confirmationCode,
                for: task,
                issueAt: new Date(),
                resend: resend,
              },
            },
          }
        );
        return {
          success: true,
          message: "Verification email sent.",
        };
      } else {
        throw new Verificaiton_Error("Verification email not sent !", 500);
      }
    } catch (error) {
      return error;
    }
  }

  async sendResetPasswordLink(username, email, link) {
    let getUser = findOneUser(
      [{ email: email }, { username: username }],
      "$or"
    );
    try {
      const isEmailSent = await sendConfirmationEmail(
        username,
        email,
        "reset",
        link
      );
      if (isEmailSent.success) {
        if (getUser) {
          return {
            success: true,
            message: "Password reset link has been sent to your registered email address.",
          };
        }
      } else {
        throw new Verificaiton_Error("couldn't send reset password link.", 500);
      }
    } catch (error) {
      return error;
    }
  }

  async VerifyConfirmationCode(code, expire) {
    const userProfile = await findOneUser({ "confirmationCode.otp": code });

    let issuedTime = new Date(
      userProfile?.confirmationCode[0].issueAt
    ).getTime();
    let now = new Date().getTime();
    let isExpire = now - issuedTime;

    try {
      if (userProfile && userProfile?.confirmationCode.length) {
        if (isExpire >= expire) {
          await updateUserData(
            { email: userProfile.email },
            { $pop: { confirmationCode: -1 } }
          );
          throw new Verificaiton_Error("invalid verification code", 401, false);
        } else {
          await updateUserData(
            { email: userProfile.email },
            { $pop: { confirmationCode: -1 } }
          );

          return {
            userProfile,
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

  

  async resendVerificationEmail(pass) {
    const user = await findOneUser({ refreshToken: pass });
    try {
      if (
        user &&
        user.confirmationCode.length > 0 &&
        user.userRequests.emailRequests.length > 0
      ) {
        const issuedTime = new Date(
            user?.confirmationCode[0]?.issueAt
          ).getTime(),
          resend = user?.confirmationCode[0]?.resend,
          now = new Date().getTime();
        const wait = new Date().getTime() + 120000;
        if (now - issuedTime > 120000 || !resend) {
          const emailSuccess = await this.sendEmail(
            user.userID,
            user.userRequests.emailRequests[0].requestedEmail,
            "verify_Email",
            true
          );
          return { ...emailSuccess, time: +wait, status: 200 };
        } else {
          return {
            success: false,
            message: "Verification code resend in 2 minutes.",
            status: 202,
          };
        }
      } else {
        throw new Verificaiton_Error("Bad request", 400);
      }
    } catch (error) {
      return error;
    }
  }
};
