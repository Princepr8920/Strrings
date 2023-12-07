const express = require("express"),
  routes = express.Router(),
  getUserProfile = require("../controllers/afterAuth/retrieveData/getUserProfile"),
  getAllUsers = require("../controllers/afterAuth/retrieveData/getusers"),
  userSearch = require("../controllers/afterAuth/retrieveData/searchUser")
  securityLock = require("../controllers/afterAuth/main/securityLock");

routes.get("/get-all-users", getAllUsers);

routes.get("/search/user/account", userSearch);

routes.get("/user/:userID", getUserProfile);

routes.post("/user/account/security", securityLock);

module.exports = routes;
