const { database } = require("../../../loaders/mongodb"),
  chatDb = database("chatCollection");

getMessages = async (req, res, next) => {
  const { userID } = req.params;

  try {
    await createANewChat(req.user.userID, userID);

    const aggregationPipeline = [
      { $match: { userID: req.user.userID } },
      {
        $project: {
          contacts: 1, // Include the contacts array
          messages: {
            $filter: {
              input: "$messages",
              cond: { $eq: ["$$this.contactID", userID] },
            },
          },
        },
      },
    ];

    const result = await chatDb.aggregate(aggregationPipeline);
    const userMessages = await result.toArray();

    let { messages, contacts } = userMessages[0];
    let isSaved = false;

    if (contacts.includes(userID)) {
      isSaved = true;
    }

    const allMessages = messages[0]?.data || [];

    return res.status(200).json({ isSaved, allMessages });
  } catch (error) {
    console.error(error)
    error = {...error,message:"Couldn't fetch messages"}
    return next(error);
  }
};

const createANewChat = async (from, to) => {
  let operations = [
    {
      updateOne: {
        filter: {
          userID: from,
          "messages.contactID": { $nin: [to] },
        },
        update: {
          $push: {
            messages: {
              contactID: to,
              data: [],
            },
          },
        },
      },
    },
    {
      updateOne: {
        filter: {
          userID: to,
          "messages.contactID": { $nin: [from] },
        },
        update: {
          $push: {
            messages: {
              contactID: from,
              data: [],
            },
          },
        },
      },
    },
  ];

  let savedMessage = await chatDb.bulkWrite(operations);
  /**
 creating fields to store messages in document of both (sender,receiver) we are using mongodb bulkWrite method
 to update documents in bulk 
*/
};

module.exports = getMessages;
