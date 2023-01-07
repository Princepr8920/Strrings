const express = require("express"),
  routes = express.Router(),
  rateLimiter = require("../middleware/rateLimiter"),
  Lock = require("../middleware/lockMiddleware"),
  { validator, dataValidationRules } = require("../middleware/validator");
let {
  getUsers,
  getCurrentUser,
  editProfile,
  verifyUserEmail,
  resendVerificaiton,
  securityLock,
  deleteAccount,
} = require("../controllers/user-controller");

routes.get("/getUsers", getUsers);
routes.get("/getUser/:username", getCurrentUser);

routes.patch(
  "/user/profile/edit",

  Lock,
  dataValidationRules,
  validator,
  editProfile
);

routes.post("/user/email/verification/done", verifyUserEmail);
routes.get(
  "/user/email/verificaiton/resend",

  rateLimiter(
    1440,
    5,
    { success: false, message: "Try again after 24 hours", status: 429 },
    429
  ),
  resendVerificaiton
);
routes.delete("/delete/account/:userID", Lock, deleteAccount);

routes.post("/user/account/security", securityLock);

module.exports = routes;
