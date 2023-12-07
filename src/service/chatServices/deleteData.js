const { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection");

async function deleteMessage(userID, contactID, messageToDelete) {
  try {
    await chatDb.updateOne(
      { userID, "messages.contactID": contactID },
      {
        $pull: {
          "messages.$[msg].data": {
            "message.messageID": { $in: messageToDelete },
          },
        },
      },
      {
        arrayFilters: [{ "msg.contactID": contactID }],
      }
    );

    return {
      deletedMsg: messageToDelete,
      message: "Message(s) deleted",
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      deletedMsg: [],
      message: "Couldn't delete Message(s)",
      success: true,
    };
  }
}

async function deleteAllMessage(userID, contactID) {
  try {
    await chatDb.updateOne(
      { userID, "messages.contactID": contactID },
      {
        $set: {
          "messages.$[msg].data": [],
        },
      },
      {
        arrayFilters: [{ "msg.contactID": contactID }],
      }
    );

    return { message: "Chat cleared", success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Couldn't clear chat" };
  }
}

module.exports = { deleteMessage, deleteAllMessage };
