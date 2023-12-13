const express = require("express"),
  router = express.Router(),
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


//profile management related routes

router.get("/api/get/user/avatar", getAvatar);

router.get("/api/get/contact/avatar", getContactAvatar);

router.patch(
  "/api/user/update-avatar",
  upload("avatar", ["image/jpeg", "image/png"]),
  updateAvatar
);

router.get("/api/user/remove-avatar", removeAvatar);

router.patch(
  "/api/user/account/manage/unique/email&username",
  mustVerifiedAccount,
  EmailOrUsernameValidation,
  validator,
  updateEmailAndUsername
);

router.patch(
  "/api/user/account/manage/information",
  userInformationValidation,
  validator,
  updateUserInfo
);

router.post(
  "/api/user/email/verification/done",
  codeValidation,
  validator,
  verifyTaskToken,
  verifyUserEmail
);

router.get(
  "/api/user/email/verificaiton/resend",
  verifyTaskToken,
  resendVerificaiton
);

router.delete("/api/delete/user-account", verifyTaskToken, deleteAccount);

module.exports = router;
