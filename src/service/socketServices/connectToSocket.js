const { markAsDelivered } = require("../chatServices/delivery");
const getLastMessage = require("../chatServices/getLastMessage");

function connectToSocket(socket, { users, names }) {
  socket.on("user-online", async () => {
    socket.userID = users[socket.id];
    socket.join(users[socket.id]);
    console.log(`${names[users[socket.id]]} is Online 🟢`);
    socket.broadcast.emit("user-joined", names[users[socket.id]]); // send user online status to everyone except itself
    let onlineUsers = Object.values(users);
    socket.emit("online-users", onlineUsers);
    socket.broadcast.emit("refresh-online-user-list", onlineUsers);
    const { deliveredMessages } = await markAsDelivered(users[socket.id]);
    const { success, message, lastAndUnread } = await getLastMessage(
      users[socket.id]
    );

    socket.emit("get-last-messages", { success, message, lastAndUnread });

    // Emit events in batches
    while (deliveredMessages.length > 0) {
      const batch = deliveredMessages.splice(0, 3);
      for (let msg of batch) {
        socket.to(msg.contactID).emit("deliveredStatusToSender", msg.data);
      }
    }
  });
}

module.exports = connectToSocket;
