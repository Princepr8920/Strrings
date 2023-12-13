const express = require("express"),
  router = express.Router(),
  getUserProfile = require("../controllers/afterAuth/retrieveData/getUserProfile"),
  getAllUsers = require("../controllers/afterAuth/retrieveData/getusers"),
  userSearch = require("../controllers/afterAuth/retrieveData/searchUser")
  securityLock = require("../controllers/afterAuth/main/securityLock");

router.get("/api/get-all-users", getAllUsers);

router.get("/api/search/user/account", userSearch);

router.get("/api/user/:userID", getUserProfile);

router.post("/api/user/account/security", securityLock);

module.exports = router;