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
const localUser = require("../models/localModel");
const bcrypt = require("bcrypt");

const refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.user_session) return res.sendStatus(403);
  if(cookies?.editing_mode){ res.clearCookie("editing_mode", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });}
  const refreshToken = cookies.user_session;
  const user = await localUser.findOne({ refreshToken }).lean();
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
    let exclude = [
      "__v",
      "_id",
      "password",
      "requestsToken",
      "provider",
      "confirmationCode",
      "refreshToken",
    ];
    const userWithToken = SecureInfo.filterInfo(user, exclude);
    return res.json({ userWithToken, accessToken });
  });
};

const signup = async (req, res) => {
  let userInfo = req.user;
  const { userID, email } = userInfo;
  sendNewEmail.sendEmail(userID, email, "Account verification", false);
  return res.status(202).json({
    message: "Account verification pending",
    email: email,
    success: true,
  });
};

const verifyUser = async (req, res, next) => {
  const confirmationCode = req.body.code;
  const { userInfo, error } = await sendNewEmail.VerifyConfirmationCode(
    confirmationCode,
    20 * 60 * 1000,
    true
  );
  if (userInfo) {
    // To generate refresh and access token
    const { refreshToken, accessToken } = await token.setToken(userInfo, [
      "refreshToken",
    ]);
    // To filter confidential informantion
    let exclude = [
      "__v",
      "_id",
      "password",
      "requestsToken",
      "provider",
      "confirmationCode",
      "refreshToken",
    ];
    const user = SecureInfo.filterInfo(userInfo._doc, exclude);
    res.cookie("user_session", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ user, accessToken });
  } else {
    res.status(401).json({ error });
    next(error);
  }
};

const login = async (req, res) => {
  let userInfo = req.user;
  const { username, email } = userInfo;
  if (userInfo.account_status === "Account verification pending") {
    sendNewEmail.sendEmail(username, email, "Account verification", false);
    return res.status(202).json({ message: userInfo.status, email: email });
  } else {
    let { refreshToken, accessToken } = await token.setToken(userInfo, [
      "refreshToken",
    ]);
    res.cookie("user_session", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    let exclude = [
      "__v",
      "_id",
      "password",
      "requestsToken",
      "provider",
      "confirmationCode",
      "refreshToken",
    ];
    let user = SecureInfo.filterInfo(userInfo._doc, exclude);
    return res.status(200).json({ user, accessToken, success: true });
  }
};

const logout = async function (req, res) {
  const cookies = req.cookies;
  if (!cookies?.user_session) return res.sendStatus(204);
  const refreshToken = cookies?.user_session;

  const user = await localUser.findOne({ refreshToken });
  if (!user) {
    res.sendStatus(403);
  } else {
    res.clearCookie("user_session", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    user.refreshToken = "";
    let cancelcodeRequest = user?.confirmationCode[0]?._id;
    let cancelRequests = user?.userRequests[0]?._id;
    user?.confirmationCode.id(cancelcodeRequest).remove();
    user?.userRequests.id(cancelRequests).remove();
    await user.save();
    res.sendStatus(204);
  }

  return req.logout((err) => {
    if (err) return err;
    console.log(req.isAuthenticated());
  });
};

const recoverPassword = async (req, res, next) => {
  let user = await localUser.findOne({ email: req.body.email });
  try {
    if (user) {
      const { username, email, _id } = user;
      const { requestsToken } = await token.setToken(user, ["requestsToken"]);
      const link = `http://localhost:4000/account/verify/${_id}/userid/${requestsToken}`;

      const { success, message, status } =
        await sendNewEmail.sendResetPasswordLink(username, email, link);
      if (success) {
        return res.status(status).json({
          success,
          message,
          info: {
            sent: "Password reset link has been sent to your Email.",
            instructions:
              "Please follow the instructions in the Email to reset your password. If you do not receive an E-mail, check your spam mail box.",
            email: email,
          },
        });
      } else {
        return res.status(status).json({
          success,
          message,
        });
      }
    } else {
      throw new Verificaiton_Error("No match found", 404);
    }
  } catch (error) {
    res.status(error.status).send({ success: false, error: error });
    next(error);
  }
};

const verifyLink = async (req, res) => {
  let { id, token } = req.params;
  localUser.findOne(
    {
      $and: [{ _id: id }, { requestsToken: token }],
    },
    (err, user) => {
      if (err) {
        return err;
      } else if (!user) {
        return res.sendStatus(404);
      } else if (user) {
        if (user.requestsToken === token) {
          res.cookie("change_once", token, {
            maxAge: 30 * 60 * 1000,
          });
          return res.redirect(
            `http://localhost:3000/user/${id}/passwordrecovery/setnewpassword/${token}`
          );
        } else {
          return res
            .status(400)
            .send(
              "<h1>Bad Request</h1><br><a href=http://localhost:3000>Login</a>"
            );
        }
      }
    }
  );
};

const setNewPassword = async (req, res, next) => {
  let { id, token } = req.params;
  let { newPassword, confirmNewPassword } = req.body;
  let user = await localUser.findOne({ _id: id, requestsToken: token });

  let isMatch = await bcrypt.compare(newPassword, user.password);

  try {
    if (!user) {
      return res.sendStatus(500);
    } else {
      if (newPassword !== confirmNewPassword) {
        throw new Validation_Error("Passwords do not match.", 409);
      } else if (newPassword?.length < 8) {
        throw new Validation_Error(
          "Use 8 or more characters with a mix of letters, numbers, and symbols.",
          401
        );
      } else if (isMatch) {
        throw new Validation_Error("Previous passwords cannot be reused.", 401);
      } else {
        user.password = newPassword;
        user.requestsToken = "";
        user.save();
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
    }
  } catch (error) {
    res.status(error.status).send({ success: false, ...error });
    next(error);
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await localUser.findOne({ email });
  try {
    if (user) {
      sendNewEmail.sendEmail(user.username, user.email);
      return res.status(200).send({ success: true, message: "OTP Sent" });
    }
    throw new Validation_Error("user not found", 404);
  } catch (error) {
    return console.error(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  refresh,
  verifyUser,
  recoverPassword,
  setNewPassword,
  verifyLink,
  resendOtp,
};
