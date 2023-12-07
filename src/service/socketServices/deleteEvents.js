const {
  deleteMessage,
  deleteAllMessage,
} = require("../chatServices/deleteData");
const { currentBatch } = require("./dataBatch");

function deleteEvents(socket, users) {
  socket.on("delete-message", async ({ contactID, messageToDelete }) => {
    let msgInBatch = currentBatch[users[socket.id]][contactID];
    let msgToDelete = [...messageToDelete];

    if (msgInBatch && msgInBatch.length) {
      for (let i = msgInBatch.length - 1; i >= 0; i--) {
        if (messageToDelete.includes(msgInBatch[i].message.messageID)) {
          let indexOfMsgId = messageToDelete.indexOf(
            msgInBatch[i].message.messageID
          );
          messageToDelete.splice(indexOfMsgId, 1);
          msgInBatch.splice(i, 1);
        }
      }

      if (messageToDelete.length) {
        let { success, deletedMsg, message } = await deleteMessage(
          users[socket.id],
          contactID,
          messageToDelete
        );
        socket.emit("message-deleted", {
          contactID,
          success,
          message,
          deletedMsg,
        });
      } else {
        socket.emit("message-deleted", {
          contactID,
          success: true,
          message: "Message(s) deleted",
          deletedMsg: msgToDelete,
        });
      }
    } else {
      let { success, deletedMsg, message } = await deleteMessage(
        users[socket.id],
        contactID,
        messageToDelete
      );
      socket.emit("message-deleted", {
        contactID,
        success,
        message,
        deletedMsg,
      });
    }
  });

  socket.on("delete-all-message", async ({ contactID }) => {
    if (currentBatch[users[socket.id]][contactID]) {
      currentBatch[users[socket.id]][contactID] = [];
    }
    let { success, message } = await deleteAllMessage(
      users[socket.id],
      contactID
    );
    socket.emit("clear-all-messages", { contactID, success, message });
  });
}

module.exports = deleteEvents;
