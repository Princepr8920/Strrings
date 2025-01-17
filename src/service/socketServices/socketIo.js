const { Server } = require("socket.io"),
  verifySocketToken = require("./socketVerification"),
  blockedIDs = require("../chatServices/blockedIDs"),
  deleteEvents = require("./deleteEvents"),
  typingEvents = require("./typingEvents"),
  contactEvents = require("./contactEvents"),
  disconnectSocket = require("./disconnectSocket"),
  connectToSocket = require("./connectToSocket"),
  messageEvents = require("./messageEvents"),
  { currentBatch } = require("./dataBatch");

function mySocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "https://www.strrings.in",
      methods: ["GET", "POST"],
    },
  });

  console.log("Web Sockets Activated ⚡");

  const users = {};
  const names = {};
  const allBlockedUserIDs = {};
  const openedChats = {};
  const userInfo = {};

  io.use(async (socket, next) => {
    const isValidToken = await verifySocketToken(socket.handshake.query.token);
    if (!isValidToken?.success) {
      return next(isValidToken); // Invalid token, reject the connection
    }

    const getBlockedContactsID = await blockedIDs(isValidToken.user.userID);

    if (isValidToken?.success && getBlockedContactsID?.success) {
      let user = isValidToken.user;
      userInfo[user.userID] = user;

      /* User object to get all data of
       current user data we can use it for differents condition, it will works like req.user*/
      users[socket.id] = user.userID; // To save userID in object for socket operation with socket key
      names[user.userID] = user?.username; // To get user name by its userID
      allBlockedUserIDs[user.userID] = getBlockedContactsID.blocked; // get all blocked contacts ids to prevent send message
      openedChats[user.userID] = []; // To get open chats
      if (!currentBatch[user.userID]) {
        currentBatch[user.userID] = {}; // create batch object for messages
      }
      return next(); // socket.io next() callback function
    }

    return next(isValidToken); // Invalid token, reject the connection
  });

  io.on("connection", async (socket) => {
    connectToSocket(socket, { users, names });
    messageEvents(socket, { users, allBlockedUserIDs, openedChats });
    typingEvents(socket, users[socket.id]);
    contactEvents(socket, { users, allBlockedUserIDs });
    deleteEvents(socket, users);
    disconnectSocket(socket, { users, names, userInfo, openedChats });
  });
}

module.exports = mySocket;
