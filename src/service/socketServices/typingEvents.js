

function typingEvents(socket,user) {
  socket.on("typing", (receiver) => {
    socket.to(receiver).emit("sender-typing", user);
  });

  socket.on("not-typing", (receiver) => {
    socket.to(receiver).emit("sender-not-typing", user);
  });
}

module.exports = typingEvents;
