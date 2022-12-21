const { sendConfirmationEmail } = require("../service/mailer"),
  { Verificaiton_Error } = require("../service/handleErrors"),
  localUser = require("../models/localModel"),
  { v4: uuidv4 } = require("uuid");

module.exports = class VerifyUser {
  #RandomDigit() {
    const digit = 2830976514,
      code = Math.floor(Math.random() * digit).toString(),
      onlySix = code.split("").slice(0, 6).join("");
    return onlySix;
  }

  async sendEmail(userID, email, task, resend) {
    const confirmationCode = this.#RandomDigit();
    const getUser = await localUser.findOne({
      $or: [{ email: email }, { userID: userID }],
    });
    try {
      let isEmailSent =
        task === "Account verification"
          ? await sendConfirmationEmail(
              getUser.username,
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
        let objId = getUser?.confirmationCode[0]?._id;
        if (objId) {
          getUser?.confirmationCode.id(objId).remove();
        }
        getUser.confirmationCode.push({
          otp: confirmationCode,
          for: task,
          issueAt: new Date(),
          resend: resend,
        });
        await getUser.save();
        return {
          success: true,
          status: 200,
          message: "Verification email sent.",
        };
      } else {
        throw new Verificaiton_Error("Verification email not sent !", 500);
      }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        status: error.status,
        message: error.message,
      };
    }
  }

  async sendResetPasswordLink(username, email, link) {
    let getUser = await localUser.findOne({
      $or: [{ email: email }, { username: username }],
    });
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
            status: 200,
            message: "Verification email sent.",
          };
        }
      } else {
        throw new Verificaiton_Error("couldn't send reset password link", 500);
      }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        status: error.status,
        message: error.message,
      };
    }
  }

  async VerifyConfirmationCode(code, expire,isNewUser) {
    const userProfile = await localUser.findOne({
      "confirmationCode.otp": code,
    });

    let issuedTime = new Date(
      userProfile?.confirmationCode[0].issueAt
    ).getTime();
    let now = new Date().getTime();
    let isExpire = now - issuedTime;
    try {
      let objId = userProfile?.confirmationCode[0]?._id;
      if (userProfile && objId) {
        if (isExpire >= expire) {
          userProfile.confirmationCode.id(objId).remove();
          throw new Verificaiton_Error("invalid verification code", 401);
        } else {
          const userID = uuidv4();
          userProfile.confirmationCode.id(objId).remove();
          if(isNewUser){
          userProfile.account_status = "Account Verified";
          userProfile.userID = userID;}
          await userProfile.save();
          return {
            success: true,
            message: "Verified succcessfully",
            status: 200,
          };
        }
      } else {
        throw new Verificaiton_Error("invalid verification code", 401);
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message, status: error.status };
    }
  }

  async resendVerificationEmail(pass) {
    const user = await localUser.findOne({ refreshToken: pass });

    try {
      if (
        user &&
        user.confirmationCode.length > 0 &&
        user.userRequests.length > 0
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
            user.userRequests[0].emailRequest,
            "verify_Email",
            true
          );
          return { ...emailSuccess, time: +wait };
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
      console.error(error);
      return {
        success: false,
        ...error,
      };
    }
  }
};
