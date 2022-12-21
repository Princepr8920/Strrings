let express = require("express");
let routes = express.Router();
const verifyJWT = require("../middleware/verifyJwt");
const verifySession = require("../middleware/sessionTokenVerify");
const local_login = require("../middleware/local_login");
const local_signup = require("../middleware/local_signup");

let {
  signup,
  login,
  verifyUser,
  logout,
  refresh,
  recoverPassword,
  setNewPassword,
  verifyLink,
  resendOtp
} = require("../controllers/auth-control");

routes.get("/", (req, res) => {
  res.sendStatus(200);
});

routes.post("/verify/user/account", verifyUser);

routes.get("/logout", logout);

routes.post("/resend",resendOtp)

routes.post("/login", local_login, login);

routes.post("/signup", local_signup, signup);

routes.get("/refresh", refresh);

routes.post("/user/password/recovery", recoverPassword);

routes.get("/account/verify/:id/userid/:token", verifySession, verifyLink);

routes.post(
  "/user/:id/password/setnewpassword/:token",
  verifySession,
  setNewPassword
);

module.exports = routes;
