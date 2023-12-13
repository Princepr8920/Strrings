const express = require("express"),
  router = express.Router(),
  getMessages = require("../controllers/afterAuth/chats/getMessages"),
  chats = require("../controllers/afterAuth/chats/chats");

router.get("/api/user-chats", chats);
router.get("/api/:userID/messages", getMessages);

module.exports = router;
