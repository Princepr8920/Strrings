const createToken = require("../../../service/createToken"),
  Secure = require("../../../utils/filterInfo"),
  SecureInfo = new Secure(),
  emailSender = require("../../../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  activateAccount = require("../../../service/activateAccount"),
  { firstLetterUpperCase } = require("../../../utils/caseSenstive");

const verifyNewUser = async (req, res, next) => {
  const confirmationCode = req.body.code;
  let user = null;

  try {
    user = await userDb.findOne({
      "tokens.signupToken": req.cookies.welcome_cookies,
    });
  } catch (error) {
    return next(error);
  }

  const VerifiedUser = await sendNewEmail.VerifyConfirmationCode(
    // To verify confirmation Code
    confirmationCode,
    20 * 60 * 1000,
    user
  );

  if (VerifiedUser.success) {
    const getAccount = await activateAccount(VerifiedUser.userProfile.email);
    /* To activate new user account and assign a unique userID.
      Remember that the userID only assign to user if it successfully verified */

    if (!getAccount.success) {
      return next(getAccount); // if any error account creation process will terminate
    }

    const tokens = await createToken({
      user: getAccount.activatedAccount,
      saveToken: ["refreshToken", "socketToken"],
      tokenName: ["refreshToken", "accessToken", "socketToken"],
      deleteToken: null,
    });

    if (tokens.success) {
      const { refreshToken, accessToken, socketToken } = tokens.createdTokens;
      let excludeInfo = [
        "password",
        "_id",
        "confirmationCode",
        "userRequests",
        "verification",
        "tokens",
        "user_logs",
        "feedback",
        "provider",
        "__v",
        "userID",
      ];

      const filteredUserInfo = SecureInfo.filterInfo(
        VerifiedUser.userProfile,
        excludeInfo
      );

      res.cookie("strrings_connect", refreshToken, {
        httpOnly: true,
        maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months session,
        secure: true,
        sameSite: "strict",
      });

      res.clearCookie("welcome_cookies", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return res.status(200).json({
        user: filteredUserInfo,
        accessToken,
        socketToken,
        message: "Signup successfully.",
      });
    } else {
      return next(tokens);
    }
  } else {
    return next(VerifiedUser);
  }
};

module.exports = verifyNewUser;
