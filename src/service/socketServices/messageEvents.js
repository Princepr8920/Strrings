const { markAsRead, readNow, readInBatch } = require("../chatServices/read");
const { deliveredNow } = require("../chatServices/delivery");
const pushNotification = require("../firebase/sendNotification");
const { batchData, currentBatch } = require("./dataBatch");

function messageEvents(socket, { users, allBlockedUserIDs, openedChats }) {
  socket.on("send", async ({ receiver, message }) => {
    const sender = users[socket.id];
    message.timestamp = new Date();
    let isBlocked = allBlockedUserIDs?.[receiver] || [];
    if (
      !allBlockedUserIDs[sender].includes(receiver) &&
      !isBlocked.includes(sender)
    ) {
      // Prevent to send and receive messages from blocked contacts  ↖
      if (message.content.trim() !== "") {
        // Prevent to send empty ("") messages ↖
        deliveredNow(users, { receiver, message }); // mark as delivered if both user online
        readNow(openedChats, { sender, receiver, message }); // mark as read if both user online
        await batchData({ sender, receiver, message }); // save messages in batches
        socket.to(receiver).emit("receive", { sender, receiver, message });
        socket.emit("message-status-to-sender", {
          sender,
          receiver,
          message,
        });
        if (openedChats[receiver] && !openedChats[receiver].includes(sender)) {
          // Only send push notification if receiver chat not open ↖
          pushNotification([sender, receiver], message);
        }
      }
    } else {
      message.content = "You can't send a message because you've been blocked.";
      socket.emit("receive", { sender, receiver: sender, message });
      // Convey a message to sender if he is blocked by receiver ↖
    }
  });

  socket.on("opened-chat", async ({ receiver }) => {
    if (
      openedChats[users[socket.id]] &&
      !openedChats[users[socket.id]].includes(receiver)
    ) {
      openedChats[users[socket.id]].push(receiver);
    }
  });

  socket.on("closed-chat", async ({ receiver }) => {
    if (openedChats[users[socket.id]]) {
      const index = openedChats[users[socket.id]].indexOf(receiver);
      openedChats[users[socket.id]].splice(index, 1);
    }
  });

  socket.on("mark-as-read", async ({ receiver, unreadMessages }) => {
    if (unreadMessages.length) {
      let sender = users[socket.id];
      if (!currentBatch[receiver]) {
        currentBatch[receiver] = {};
      }
      let { updatedReadStatus } = await markAsRead(
        sender,
        receiver,
        unreadMessages
      );

      if (!updatedReadStatus.length) {
        updatedReadStatus = readInBatch(
          unreadMessages,
          currentBatch[receiver][sender],
          currentBatch[sender][receiver]
        );
      }

      socket
        .to(receiver)
        .emit("update-sender-messages", { updatedReadStatus, sender });
      socket.emit("update-receiver-messages", receiver);
    }
  });
}

module.exports = messageEvents;
