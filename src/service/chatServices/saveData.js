const { Update_Error } = require("../handleErrors"),
  { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection");

async function saveMessage(userIDs, messagesInBatches) {
  try {
    let setNewBatch = [];
    let operations = [];
    for (let i = 0; i < userIDs.length; i++) {
      setNewBatch[i] = {};
      for (let contactID in messagesInBatches[i]) {
        operations.push({
          updateOne: {
            filter: {
              userID: userIDs[i],
              "messages.contactID": contactID,
            },
            update: {
              $push: {
                "messages.$.data": { $each: messagesInBatches[i][contactID] },
              },
            },
          },
        });
        setNewBatch[i][contactID] = []; // set empty batch because it has been saved to Db
      }
    }

    let savedMessage = await chatDb.bulkWrite(operations);
    /*
Updating message array, we are using mongodb bulkWrite method
 to update documents in bulk 
*/

    if (!savedMessage?.result?.nModified) {
      throw new Update_Error("Something went wrong");
    }

    return {
      success: true,
      message: "Data saved successfully.",
      newBatch: setNewBatch,
    };
  } catch (error) {
    console.error(error);
    return {
      ...error,
      newBatch: null,
      success: false,
      message: "Data not saved.",
    };
  }
}

module.exports = saveMessage;
