const { currentBatch } = require("../socketServices/dataBatch"),
  { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection");

async function getUndeliveredMessages(userID) {
  /* find all undelivered messages of particular user 
  where the receiver is equal to the userID
  */

  try {
    const usersWithUnreadMessages = await chatDb
      .aggregate([
        {
          $match: {
            userID: userID,
          },
        },
        {
          $unwind: "$messages",
        },
        {
          $unwind: "$messages.data",
        },
        {
          $match: {
            "messages.data.receiver": userID,
            "messages.data.message.delivered": false,
          },
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              contactID: "$messages.contactID",
            },
            userID: { $first: "$userID" },
            username: { $first: "$username" },
            messages: {
              $push: {
                sender: "$messages.data.sender",
                receiver: "$messages.data.receiver",
                message: "$messages.data.message",
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id._id",
            userID: { $first: "$userID" },
            username: { $first: "$username" },
            messages: {
              $push: {
                contactID: "$_id.contactID",
                data: "$messages",
              },
            },
          },
        },
      ])
      .next();

    return {
      success: true,
      deliveredMessages: usersWithUnreadMessages?.messages || [],
    };
  } catch (error) {
    console.error(error);
    return { success: false, deliveredMessages: [] };
  }
}

async function markAsDelivered(userID) {
  // Update all undelivered messages to delivered (of both sides) where the receiver is equal to the userID
  try {
    const { success, deliveredMessages } = await getUndeliveredMessages(userID);
    const operations = [];

    for (let messages of deliveredMessages) {
      let receiverSideUpdate = {
        updateMany: {
          filter: {
            userID,
            "messages.contactID": messages.contactID,
            "messages.data.message.delivered": false,
          },
          update: {
            $set: { "messages.$[msg].data.$[msgData].message.delivered": true },
          },
          arrayFilters: [
            { "msg.contactID": messages.contactID },
            { "msgData.message.delivered": false },
          ],
        },
      };
      let senderSideUpdate = {
        updateMany: {
          filter: {
            userID: messages.contactID,
            "messages.contactID": userID,
            "messages.data.message.delivered": false,
          },
          update: {
            $set: { "messages.$[msg].data.$[msgData].message.delivered": true },
          },
          arrayFilters: [
            { "msg.contactID": userID },
            { "msgData.message.delivered": false },
          ],
        },
      };

      operations.push(receiverSideUpdate, senderSideUpdate);
    }

    if (success) {
      if (!currentBatch[userID]) {
        currentBatch[userID] = {};
      }

      let batch = currentBatch[userID];
      //To update and save the messages batch if any exist
      for (let contactID in batch) {
        for (let msg of batch[contactID]) {
          msg.message.delivered = true;
        }
        operations.push({
          updateOne: {
            filter: {
              userID: userID,
              "messages.contactID": contactID,
            },
            update: {
              $push: {
                "messages.$.data": { $each: batch[contactID] },
              },
            },
          },
        });

        deliveredMessages.push({
          contactID: contactID,
          data: batch[contactID],
        });
      }
    }

    if (operations.length) {
      let saveUpdatedDeliveryStatus = await chatDb.bulkWrite(operations);
      if (saveUpdatedDeliveryStatus.result.nModified) {
        /* If documents are saved in DB so we return
    the delivery status as delivered for client-side (delivered:true)*/
        for (let user of deliveredMessages) {
          for (let i of user.data) {
            i.message.delivered = true;
          }
        }
      }
    }

    return { success: true, deliveredMessages };
  } catch (error) {
    let batch = currentBatch[userID];
    //set batch message to delivered:false
    for (let contactID in batch) {
      for (let msg of batch[contactID]) {
        msg.message.delivered = false;
      }
    }
    console.error(error);
    return { success: false, deliveredMessages: [] };
  }
}

function deliveredNow(users, chat) {
  const { receiver, message } = chat;
  const onlineUsers = Object.values(users);

  if (onlineUsers.includes(receiver)) {
    message.sent = true;
    message.delivered = true;
  }
}

module.exports = { markAsDelivered, deliveredNow };
