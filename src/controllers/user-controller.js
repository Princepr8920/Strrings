const { Update_Error, Verificaiton_Error } = require("../service/handleErrors");
const updateUserInfo = require("../service/updateUser");
const localUser = require("../models/localModel"),
  Secure = require("../utils/filterInfo"),
  SecureInfo = new Secure(),
  infoChecker = require("../service/checkExistenceService"),
  emailSender = require("../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  passwordService = require("../service/passwordService"),
  SECURE_PASSWORD = new passwordService();
const TokenMachine = require("../service/createToken");
const token = new TokenMachine();

getUsers = async (req, res) => {
  let data = await localUser.find().lean();
  if (data) {
    let exclude = [
      "__v",
      "_id",
      "password",
      "passwordResetToken",
      "provider",
      "confirmationCode",
      "email",
      "refreshToken",
      "status",
    ];
    const users = SecureInfo.filterInfo(data, exclude);
    return res.status(200).json(users);
  } else {
    return res.status(404).json({ success: false, message: "No users found" });
  }
};

const getCurrentUser = async (req, res) => {
  let username = req.params.username;
  let user = await localUser.findOne({ username }).lean();
  if (user) {
    let exclude = [
      "__v",
      "_id",
      "password",
      "passwordResetToken",
      "provider",
      "confirmationCode",
      "refreshToken",
      "status",
    ];
    const filtredInfo = SecureInfo.filterInfo(user, exclude);
    res.status(200).json(filtredInfo);
  }
};

const editProfile = async (req, res) => {
  const update = req.body.update,
    userID = req.body.userID,
    user = await localUser.findOne({ userID });
  try {
    if (user) {
      const userExistenceCheck = new infoChecker(update),
        data = await userExistenceCheck.userExistance();
      if (!data.success) {
        return res.status(data.status).json(data);
      } else if (data.user.hasOwnProperty("email")) {
        let objId = user.userRequests[0]?._id;
        if (objId) {
          user.userRequests.id(objId).remove();
        }
        user.userRequests.push({
          emailRequest: data.user.email,
          issueAt: new Date(),
        });
        await user.save();
        const sendMail = await sendNewEmail.sendEmail(
          userID,
          data.user.email,
          "verify_Email",
          false
        );

        return res
          .status(sendMail.status === 200 ? 202 : sendMail.status)
          .json({ success: sendMail.success, message: sendMail.message });
      } else {
        const updateSuccess = await updateUserInfo({ update, userID }); /// this is a temporary to records history of updates later i changed this with mongodb

        return res.status(updateSuccess.status).json(updateSuccess);
      }
    } else {
      throw new Update_Error("invalid update request", 400);
    }
  } catch (error) {
    console.error(error);
    res.status(error.status).json(error);
  }
};

const verifyUserEmail = async (req, res) => {
  const { code, userID } = req.body,
    expire = 10 * 60 * 1000,
    { success, status, message } = await sendNewEmail.VerifyConfirmationCode(
      code,
      expire,
      false
    );

  let user = await localUser.findOne({ userID });

  if (success && user) {
    const updateSuccess = await updateUserInfo({
      update: { email: user?.userRequests[0].emailRequest },
      userID,
    });
    let objId = user?.userRequests[0]?._id;
    user?.userRequests.id(objId).remove();
    await user.save();
    return res.status(status).json(updateSuccess);
  } else {
    return res.status(status).json({ success, status, message });
  }
};

const resendVerificaiton = async (req, res) => {
  const token = req.cookies.user_session;
  const isEmailSent = await sendNewEmail.resendVerificationEmail(token);
  return res.status(isEmailSent.status).json(isEmailSent);
};

const deleteAccount = async (req, res) => {
  const userID = req.params.userID;

  localUser.findOneAndDelete(userID, (err, deleted) => {
    if (err) return err;
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Account deleted successfully",
    });
  });
};

const securityLock = async (req, res) => {
  const { securityCode, userID } = req.body;

  try {
    const isPasswordOK = await SECURE_PASSWORD.checkPassword(
      securityCode,
      userID
    );
    if (isPasswordOK) {
      const user = await localUser.findOne({ userID });
      const { securityToken } = await token.setToken(user, ["securityToken"]);
      await localUser.findOneAndUpdate(
        { userID },
        { securityToken },
        { new: true }
      );
      res.cookie("editing_mode", securityToken, {
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000,
      });
      return res.sendStatus(200);
    } else {
      throw new Verificaiton_Error("Invalid password", 401);
    }
  } catch (error) {
    console.log(error);
    return res.status(error.status).json({ ...error, success: false });
  }
};

module.exports = {
  getUsers,
  getCurrentUser,
  editProfile,
  verifyUserEmail,
  resendVerificaiton,
  securityLock,
  deleteAccount,
};
