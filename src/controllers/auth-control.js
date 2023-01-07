const {
  Validation_Error,
  Verificaiton_Error,
} = require("../service/handleErrors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const TokenMachine = require("../service/createToken");
const token = new TokenMachine();
const Secure = require("../utils/filterInfo");
const SecureInfo = new Secure();
const emailSender = require("../service/confirmationCode");
const sendNewEmail = new emailSender();
const { findOneUser, updateUserData } = require("../database/database");
const activateAccount = require("../service/activateAccount");
const passwordService = require("../service/passwordService");
const SECURE_PASSWORD = new passwordService();

const refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.user_session) return res.sendStatus(403);
  if (cookies?.editing_mode) {
    res.clearCookie("editing_mode", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
  }
  const refreshToken = cookies.user_session;
  const user = await findOneUser({ refreshToken });
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err || user.userID !== decoded.userID)
      return res
        .status(401)
        .send({ success: false, message: "Your session has expired" });
    let payload = { userID: decoded.userID, id: decoded._id };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "1h",
    });
    const userWithToken = SecureInfo.filterInfo(user);
    return res.json({ userWithToken, accessToken });
  });
};

const signup = async (req, res) => {
  return res.status(202).json({
    message: "Account verification pending",
    email: req.user.email,
    success: true,
  });
};

const verifyNewUser = async (req, res, next) => {
  const confirmationCode = req.body.code;
  const VerifiedUser = await sendNewEmail.VerifyConfirmationCode(
    confirmationCode,
    20 * 60 * 1000,
    true
  );

  if (VerifiedUser.success) {
    const activatedAccount = await activateAccount(
      VerifiedUser.userProfile.email
    );
    const { refreshToken, accessToken } = await token.setToken(
      activatedAccount,
      ["refreshToken"]
    );
    const user = SecureInfo.filterInfo(VerifiedUser.userProfile);
    res.cookie("user_session", refreshToken, {
      httpOnly: true,
      maxAge: 168 * 60 * 60 * 1000,
    });
    return res.status(200).json({ user, accessToken });
  } else {
    next(VerifiedUser);
  }
};

const login = async (req, res, next) => {
  let userInfo = req.user;
  const { username, email } = userInfo;
  if (
    userInfo.account_status === "Account verification pending" &&
    !userInfo?.userID
  ) {
    const mailSuccess = await sendNewEmail.sendEmail(
      username,
      email,
      "Account verification",
      false
    );
    if (mailSuccess.success) {
      return res
        .status(202)
        .json({ message: "Account verification pending.", email: email });
    } else {
      next(mailSuccess);
    }
  } else {
    let { refreshToken, accessToken } = await token.setToken(userInfo, [
      "refreshToken",
    ]);
    res.cookie("user_session", refreshToken, {
      httpOnly: true,
      maxAge: 168 * 60 * 60 * 1000,
    });
    let user = SecureInfo.filterInfo(userInfo);
    return res.status(200).json({ user, accessToken, success: true });
  }
};

const logout = async function (req, res) {
  const cookies = req.cookies;
  if (!cookies?.user_session) return res.sendStatus(204);
  const refreshToken = cookies?.user_session;

  const user = await findOneUser({ refreshToken });
  if (!user) {
    res.sendStatus(403);
  } else {
    res.clearCookie("user_session", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    let cancelCodeRequest = user?.confirmationCode;
    let cancelRequests = user?.userRequests;

    if (
      cancelCodeRequest.length ||
      cancelRequests.length ||
      refreshToken !== ""
    ) {
      await updateUserData(
        { email: user.userID },
        {
          $set: { refreshToken: "" },
          $pop: { userRequests: -1, confirmationCode: -1 },
        }
      );
    }
    res.sendStatus(204);
  }
  return req.logout((err) => {
    if (err) return err;
    console.log(req.isAuthenticated(), "User logout successfully");
  });
};

const recoverPassword = async (req, res, next) => {
  let user = await findOneUser({ email: req.body.email });
  try {
    if (user) {
      const { username, email } = user;
      const { requestsToken } = await token.setToken(user, ["requestsToken"]);
      const link = `http://localhost:4000/account/verify/${requestsToken}`;

      const { success, message } = await sendNewEmail.sendResetPasswordLink(
        username,
        email,
        link
      );
      if (success) {
        return res.status(200).json({
          success,
          message,
          info: {
            instructions:
              "Please follow the instructions in the Email to reset your password. If you do not receive an E-mail, check your spam mail box.",
            email: email,
          },
        });
      } else {
        return res.status(500).json({
          success,
          message,
        });
      }
    } else {
      throw new Verificaiton_Error("No match found", 404);
    }
  } catch (error) {
    return next(error);
  }
};

const verifyLink = async (req, res) => {
  let { token } = req.params;
  const user = await findOneUser({ requestsToken: token });
 
  if (!user) {
    return res.sendStatus(404);
  } else if (user) {
    if (user.requestsToken === token) {
      res.cookie("change_once", token, {
        maxAge: 30 * 60 * 1000,
      });
      return res
        .status(302)
        .redirect(
          `http://localhost:3000/user/passwordrecovery/setnewpassword/${token}`
        );
    } else {
      return res
        .status(400)
        .send(
          "<h1>Bad Request</h1><br><a href=http://localhost:3000>Login</a>"
        );
    }
  }
};

const setAccountNewPassword = async (req, res, next) => {
  let { token } = req.params;
  let { newPassword } = req.body;
  let user = await findOneUser({ requestsToken: token });

  try {
    if (!user) {
      return res.sendStatus(500);
    } else {
      await SECURE_PASSWORD.setNewPassword(newPassword, user.email);

      res.clearCookie("change_once", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      return res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    }
  } catch (error) {
   return next(error);
  }
};

///// this route need restore

const resendOtp = async (req, res,next) => {
  const { email } = req.body;
  const user = await findOneUser({ email });
  try {
    if (user) {
      sendNewEmail.sendEmail(user.username, user.email);
      return res.status(200).send({ success: true, message: "OTP Sent" });
    }
    throw new Validation_Error("user not found", 404);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  refresh,
  verifyNewUser,
  recoverPassword,
  setAccountNewPassword,
  verifyLink,
  resendOtp,
};
