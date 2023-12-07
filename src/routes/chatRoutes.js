const express = require("express"),
  routes = express.Router(),
  getMessages = require("../controllers/afterAuth/chats/getMessages"),
  chats = require("../controllers/afterAuth/chats/chats");

routes.get("/user-chats", chats);
routes.get("/:userID/messages", getMessages);

module.exports = routes;
