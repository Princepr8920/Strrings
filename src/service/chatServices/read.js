const { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection");

async function markAsRead(userID, contactID, unread_messages) {
  try {
    const operations = [
      {
        updateMany: {
          filter: {
            userID: contactID,
            "messages.contactID": userID,
            "messages.data.message.read": false,
          },
          update: {
            $set: { "messages.$[msg].data.$[msgData].message.read": true },
          },
          arrayFilters: [
            { "msg.contactID": userID },
            { "msgData.message.read": false },
          ],
        },
      },
      {
        updateMany: {
          filter: {
            userID: userID,
            "messages.contactID": contactID,
            "messages.data.message.read": false,
          },
          update: {
            $set: { "messages.$[msg].data.$[msgData].message.read": true },
          },
          arrayFilters: [
            { "msg.contactID": contactID },
            { "msgData.message.read": false },
          ],
        },
      },
    ];

    const readMessagesByBothSides = await chatDb.bulkWrite(operations);

    let updatedReadStatus = [];

    if (readMessagesByBothSides.result.nModified) {
      for (let i = 0; i < unread_messages.length; i++) {
        unread_messages[i].message.read = true;
        unread_messages[i].message.delivered = true;
        updatedReadStatus[i] = unread_messages[i];
      }
    }

    /*
  if messages are read and updated in database so we will update
  the all unread messages to read:true with 'for loop' and send
  updated message status to sender else if messages not read and 
  updated in database so it return unread_messages = [] to sender
   */

    return {success:true,updatedReadStatus};
  } catch (error) {
    console.error(error);
     return {success:false,updatedReadStatus:[]};
  }
}

function readNow(openedChats, chat) {
  const { sender, receiver, message } = chat;
  if (openedChats[receiver] && openedChats[receiver].includes(sender)) {
    message.read = true;
  }
}

function readInBatch(unread_messages, receiverSideMsg, senderSideMsg) {
  let read = [];
  let receiverMsgs =
    receiverSideMsg && receiverSideMsg.length ? receiverSideMsg : [];
  let senderMsgs = senderSideMsg && senderSideMsg.length ? senderSideMsg : [];
  let readAll = [unread_messages, senderMsgs, receiverMsgs];
  // read all unread messages of sender, receiver and return all updated msgs as "unread_messages"
  for (let i = 0, len = readAll.length; i < len; i++) {
    let r = readAll[i];
    for (let j = 0, len2 = r.length; j < len2; j++) {
      r[j].message.read = true;
      r[j].message.delivered = true;
      if (i === 0) {
        read[j] = r[j];
      }
    }
  }

  return read;
}

module.exports = { markAsRead, readNow, readInBatch };
