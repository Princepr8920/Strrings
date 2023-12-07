const { blockUser, unblockUser } = require("../chatServices/blockUser");
const addNewContact = require("../chatServices/addNewContact");
const removeContact = require("../chatServices/removeContact");

function contactEvents(socket,{users,allBlockedUserIDs}) {
  socket.on("add-to-chats", async (contactID) => {
    let data = await addNewContact({ contactID, userID: users[socket.id] });
    socket.emit("user-added-to-chats", data);
  });

  socket.on("remove-from-chats", async (contactID) => {
    let data = await removeContact({ contactID, userID: users[socket.id] });
    socket.emit("user-removed-from-chats", data);
  });

  socket.on("block-user", async (contactID) => {
    if (!allBlockedUserIDs[users[socket.id]].includes(contactID)) {
      let block = await blockUser({ contactID, userID: users[socket.id] });
      if (block.success) {
        allBlockedUserIDs[users[socket.id]].push(contactID);
      }
      socket.emit("user-blocked", block);
    }
  });

  socket.on("unblock-user", async (contactID) => {
    if (allBlockedUserIDs[users[socket.id]].includes(contactID)) {
      let unblock = await unblockUser({
        contactID,
        userID: users[socket.id],
      });
      if (unblock.success) {
        let IDindex = allBlockedUserIDs[users[socket.id]].indexOf(contactID);
        allBlockedUserIDs[users[socket.id]].splice(IDindex, 1);
      }
      socket.emit("user-unblocked", unblock);
    }
  });
}

module.exports = contactEvents;
