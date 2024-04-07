const { v4: uuidv4 } = require("uuid"),
  saveMessage = require("../chatServices/saveData"),
  currentBatch = {};

async function batchData(data) {
  const { sender, receiver, message } = data;

  if (!currentBatch[receiver]) {
    currentBatch[receiver] = {}; // if receiver batch is not assigned
  }
  let isSavedToDb = false;
  let senderBatch = currentBatch[sender];
  let receiverBatch = currentBatch[receiver];
  if (!senderBatch[receiver]) {
    senderBatch[receiver] = [];
  }

  if (!receiverBatch[sender]) {
    receiverBatch[sender] = [];
  }

  if (
    senderBatch[receiver].length >= 100 ||
    receiverBatch[sender].length >= 100
  ) {
    let { newBatch, success } = await saveMessage(
      [sender, receiver],
      [senderBatch, receiverBatch]
    );
    isSavedToDb = success;
    if (success) {
      senderBatch = newBatch[0];
      receiverBatch = newBatch[1];
    }
  }

  try {
    const msgID = uuidv4();
    message.messageID = msgID; // set message ID
    message.sent = true; // set message sent status to true
    senderBatch[receiver].push(data); //Insert message data to batch
    receiverBatch[sender].push(data); //Insert message data to batch

    // Only clear batch if data saved in Db ↙
    if (isSavedToDb) {
      currentBatch[sender] = senderBatch;
      currentBatch[receiver] = receiverBatch;
      isSavedToDb = false;
    }

    return { success: true, message: "Data saved successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
}

module.exports = { batchData, currentBatch };
