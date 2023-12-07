const express = require("express"),
  routes = express.Router(),
  {
    validator,
    userInformationValidation,
    EmailOrUsernameValidation,
    codeValidation,
  } = require("../middleware/validator"),
  verifyTaskToken = require("../middleware/verifyTaskToken"),
  upload = require("../middleware/multer");

const deleteAccount = require("../controllers/afterAuth/accountUpdate/deleteAccount"),
  updateEmailAndUsername = require("../controllers/afterAuth/accountUpdate/updateAccount"),
  updateUserInfo = require("../controllers/afterAuth/accountUpdate/updateUserInfo"),
  {
    verifyUserEmail,
    resendVerificaiton,
  } = require("../controllers/afterAuth/accountUpdate/verifyNewEmail"),
  {
    updateAvatar,
    getAvatar,
    removeAvatar,
    getContactAvatar,
  } = require("../controllers/afterAuth/accountUpdate/updateAvatar"),
  mustVerifiedAccount = require("../middleware/ensureVerified");

routes.get("/get/user/avatar", getAvatar);

routes.get("/get/contact/avatar", getContactAvatar);

routes.patch(
  "/user/update-avatar",
  upload("avatar", ["image/jpeg", "image/png"]),
  updateAvatar
);

routes.get("/user/remove-avatar", removeAvatar);

routes.patch(
  "/user/account/manage/unique/email&username",
  mustVerifiedAccount,
  EmailOrUsernameValidation,
  validator,
  updateEmailAndUsername
);

routes.patch(
  "/user/account/manage/information",
  userInformationValidation,
  validator,
  updateUserInfo
);

routes.post(
  "/user/email/verification/done",
  codeValidation,
  validator,
  verifyTaskToken,
  verifyUserEmail
);

routes.get(
  "/user/email/verificaiton/resend",
  verifyTaskToken,
  resendVerificaiton
);

routes.delete("/delete/user-account", verifyTaskToken, deleteAccount);

module.exports = routes;
