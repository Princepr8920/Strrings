const { Update_Error, Verificaiton_Error } = require("../service/handleErrors");
const updateUserInfo = require("../service/updateUser"),
  Secure = require("../utils/filterInfo"),
  SecureInfo = new Secure(),
  emailSender = require("../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  passwordService = require("../service/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  TokenMachine = require("../service/createToken"),
  token = new TokenMachine();
const {
  findOneUser,
  findAll,
  updateUserData,
  deleteUserData,
} = require("../database/database");
const { requestManager } = require("../service/requestManager");

getUsers = async (req, res) => {
  let data = await findAll();
  if (data) {
    let exclude = [
      "__v",
      "_id",
      "password",
      "passwordResetToken",
      "provider",
      "confirmationCode",
      "status",
      "userID",
      "email",
      "security",
      "account_status",
      "userRequests",
      "user_logs",
      "preferences",
      "securityToken",
      "refreshToken",
    ];
    const users = SecureInfo.filterInfo(data, exclude);
    return res.status(200).json(users);
  } else {
    return res.status(404).json({ success: false, message: "No users found" });
  }
};

const getCurrentUser = async (req, res) => {
  let username = req.params.username;
  let user = await findOneUser({ username });
  if (user) {
    const filtredInfo = SecureInfo.filterInfo(user);
    return res.status(200).json(filtredInfo);
  } else {
    return res.sendStatus(404);
  }
};

const editProfile = async (req, res, next) => {
  const update = req.body,

    refreshToken = req?.cookies?.user_session,
    user = await findOneUser({ refreshToken });
  
  try {
    if (user) {
      let isEmailRequest = null;
      if (update?.hasOwnProperty("email")) {
        let isRequestManaged = await requestManager(update, user);
        if (!isRequestManaged?.success) {
          throw new Update_Error("Email update failed", 422);
        }
        isEmailRequest = isRequestManaged;
        delete update.email; /// delete this property because email will verify and update rest property
        if (!Object.keys(update).length) {
          return res.status(202).json(isEmailRequest);
        }
      }
      const updateSuccess = await updateUserInfo({ update, user });
      if (updateSuccess?.success) {
        return isEmailRequest
          ? res.status(202).json({ isEmailRequest, updateSuccess })
          : res.status(200).json({
              user: updateSuccess.user,
              success: true,
              message: updateSuccess.message,
            });
      } else {
        throw new Update_Error(updateSuccess?.message || "Couldn't update information", 422);
      }
    } else {
      throw new Update_Error("Something went wrong", 500);
    }
  } catch (error) {
    return next(error);
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
  const user = await findOneUser({ userID });

  if (success && user) {
    const updateSuccess = await updateUserInfo({
      update: { email: user?.userRequests.emailRequests[0].requestedEmail },
      user,
    });

    const isRequested = user.userRequests.emailRequests.length;

    if (isRequested) {
      await updateUserData(
        { userID: user.userID },
        { $pop: { "userRequests.emailRequests": -1 } }
      );
    }

    return res.status(200).json(updateSuccess);
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
  await deleteUserData({ userID });
  return res.status(200).json({
    status: 200,
    success: true,
    message: "Account deleted successfully",
  });
};

const securityLock = async (req, res, next) => {
  const { securityCode, userID } = req.body;
  try {
    const isPasswordOK = await SECURE_PASSWORD.checkPassword(
      securityCode,
      userID
    );
    if (isPasswordOK) {
      const user = await findOneUser({ userID });
      const { securityToken } = await token.setToken(user, ["securityToken"]);
      await updateUserData({ userID }, { $set: { securityToken } });
      res.cookie("editing_mode", securityToken, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000,
      });
      return res.sendStatus(200);
    } else {
      throw new Verificaiton_Error("Wrong Password", 401);
    }
  } catch (error) {
    return next(error);
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
