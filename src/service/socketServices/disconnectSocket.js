const saveMessage = require("../chatServices/saveData"),
  { currentBatch } = require("./dataBatch"),
  updateUserSession = require("./userSession");

function disconnectSocket(socket, { users, names, userInfo, openedChats }) {
  socket.on("disconnect", async () => {
    let getUserID = users[socket.id];
    socket.broadcast.emit("user-left", getUserID);
    console.log(`${names[getUserID]} is Offline 🔴`);
    await updateUserSession(userInfo[getUserID]);
    if (currentBatch[getUserID]) {
      /*To save batches messages and delete batch*/
      await saveMessagesOnDisconnect(users, getUserID);
    }
    socket.broadcast.emit("user-last-seen", {
      userID: getUserID,
      lastSeen: new Date(),
    }); // Send the last seen immedately to all users
    delete openedChats[getUserID];
    delete users[socket.id];
    delete names[getUserID];
    let onlineUsers = Object.values(users);
    socket.broadcast.emit("refresh-online-user-list", onlineUsers);
    socket.emit("online-users", Object.values(onlineUsers));
  });
}

async function saveMessagesOnDisconnect(onlineUsers, userID) {
  let onlineUsersArr = Object.values(onlineUsers);
  let messagesReceivers = Object.keys(currentBatch[userID]);
  /*This function saves all messages batch of sender
 along with it also save the messages of sender to receiver side
  and delete sender object from receiver batch.*/

  if (messagesReceivers.length) {
    let usersId = [userID];
    let usersBatch = [currentBatch[userID]];

    for (let receiver of messagesReceivers) {
      if (
        !onlineUsersArr.includes(receiver) &&
        currentBatch[receiver]?.[userID]
      ) {
        usersId.push(receiver);
        usersBatch.push({ [userID]: currentBatch[receiver][userID] });
      }
    }
    let { success } = await saveMessage(usersId, usersBatch);

    if (success) {
      // delete messages if these are saved in db
      for (let receiver of messagesReceivers) {
        if (
          !onlineUsersArr.includes(receiver) &&
          currentBatch[receiver]?.[userID]
        ) {
          delete currentBatch[receiver][userID];
        }
      }
      delete currentBatch[userID]; // delete user batch
    }
  }
}

module.exports = disconnectSocket;
