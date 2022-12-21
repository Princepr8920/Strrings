const express = require("express"),
  routes = express.Router(),
  isAuthOk = require("../middleware/ensureAuth"),
  rateLimiter = require("../middleware/rateLimiter");
Lock = require("../middleware/lockMiddleware");

let {
  getUsers,
  getCurrentUser,
  editProfile,
  verifyUserEmail,
  resendVerificaiton,
  securityLock,
  deleteAccount,
} = require("../controllers/user-controller");

routes.get("/getUsers", isAuthOk, getUsers);
routes.get("/getUser/:username", isAuthOk, getCurrentUser);
routes.patch("/user/profile/edit", isAuthOk, Lock, editProfile);
routes.post("/user/email/verification/done", isAuthOk, verifyUserEmail);
routes.get(
  "/user/email/verificaiton/resend",
  isAuthOk,
  rateLimiter(
    1440,
    5,
    { success: false, message: "Try again after 24 hours", status: 429 },
    429
  ),
  resendVerificaiton
);
routes.delete("/delete/account/:userID", isAuthOk,Lock, deleteAccount);

routes.post("/user/account/security", isAuthOk, securityLock);

module.exports = routes;
