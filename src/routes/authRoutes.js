const express = require("express");
(routes = express.Router()),
  (verifyTaskToken = require("../middleware/verifyTaskToken")),
  (local_login = require("../middleware/local_login")),
  (local_signup = require("../middleware/local_signup")),
  (signup = require("../controllers/beforeAuth/authControllers/signup")),
  (login = require("../controllers/beforeAuth/authControllers/login")),
  (refresh = require("../controllers/beforeAuth/persistantControllers/refresh")),
  (verifyNewUser = require("../controllers/beforeAuth/verificationControllers/verifyUser")),
  (cancelVerification = require("../controllers/beforeAuth/verificationControllers/cancelVerification")),
  (resendOtp = require("../controllers/beforeAuth/verificationControllers/resendVerification")),
  (recoverPassword = require("../controllers/beforeAuth/recoveryControllers/recover")),
  (setNewPassword = require("../controllers/beforeAuth/recoveryControllers/newPassword")),
  (resetPasswordLink = require("../controllers/beforeAuth/recoveryControllers/resetLink")),
  (mustVerifiedAccount = require("../middleware/ensureVerified")),
  (twoStepVerification = require("../middleware/twoStepVerifiation")),
  ({
    validator,
    signupValidation,
    recoverPasswordValidation,
    signinValidation,
    codeValidation,
  } = require("../middleware/validator"));

routes.post(
  "/login",
  mustVerifiedAccount,
  signinValidation,
  validator,
  local_login,
  login
); /// when two-step-verification disabled

routes.post(
  "/two-step-verification",
  verifyTaskToken,
  twoStepVerification,
  login
); // when two-step-verification enabled

routes.get("/resend-2-step-verification-code", verifyTaskToken, resendOtp);

routes.post(
  "/signup",
  mustVerifiedAccount,
  signupValidation,
  validator,
  local_signup,
  signup
);

routes.post(
  "/verify-user-account",
  codeValidation,
  validator,
  verifyTaskToken,
  verifyNewUser
);

routes.get("/resend-account-verification-code", verifyTaskToken, resendOtp);

routes.delete("/cancel-verification", cancelVerification);

routes.get("/refresh", refresh);

routes.post("/user/password/recovery", recoverPassword);

routes.get("/account/verify/:token", resetPasswordLink);

routes.post(
  "/user/password/setnewpassword/:token",
  verifyTaskToken,
  recoverPasswordValidation,
  validator,
  setNewPassword
);

module.exports = routes;
