let express = require("express");
let routes = express.Router();
const verifySession = require("../middleware/requestTokenVerify");
const local_login = require("../middleware/local_login");
const local_signup = require("../middleware/local_signup");
const {
  validator,
  dataValidationRules,
  codeValidation,
} = require("../middleware/validator");
let {
  signup,
  login,
  verifyNewUser,
  logout,
  refresh,
  recoverPassword,
  setAccountNewPassword,
  verifyLink,
  resendOtp,
} = require("../controllers/auth-control");

routes.get("/", (req, res) => {
  res.sendStatus(200);
});

routes.post("/verify/user/account", codeValidation, validator, verifyNewUser);

routes.get("/logout", logout);

routes.post("/resend", resendOtp);

routes.post("/login", local_login, login);

routes.post("/signup", dataValidationRules, validator, local_signup, signup);

routes.get("/refresh", refresh);

routes.post("/user/password/recovery", recoverPassword);

routes.get("/account/verify/:token", verifySession, verifyLink);

routes.post(
  "/user/password/setnewpassword/:token",
  verifySession,
  setAccountNewPassword
);

module.exports = routes;
