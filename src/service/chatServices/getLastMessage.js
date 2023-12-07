const { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection");

getLastMessages = async (userID) => {
  try {
    const lastMessages = await chatDb.aggregate([
      {
        $match: { userID },
      },
      {
        $project: {
          _id: 1,
          userID: 1,
          last_unread: {
            $map: {
              input: "$messages",
              as: "msg",
              in: {
                contactID: "$$msg.contactID",
                lastMessage: {
                  $arrayElemAt: ["$$msg.data", -1],
                },
                unreadMessage: {
                  $filter: {
                    input: "$$msg.data",
                    as: "msgData",
                    cond: {
                      $and: [
                        { $eq: ["$$msgData.message.read", false] },
                        { $ne: ["$$msgData.sender", "$userID"] },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    /* The above aggrigation pipeline only returns unread messages
    (read:false) and last message of all contacts that sender not equal to 
    userID and all contacts last message */

    let { last_unread } = await lastMessages.next(); // next() function is used to retrieve the actual result. this is not parameter (next)

    const lastAndUnread = {
      lastMessage: {},
      unreadMessage: {},
    };

    for (let obj of last_unread) {
      if (obj?.lastMessage) {
        lastAndUnread.lastMessage[obj.contactID] = obj.lastMessage;
      }
      if (obj?.unreadMessage.length) {
        lastAndUnread.unreadMessage[obj.contactID] = obj.unreadMessage;
      }
    }

    return {
      success: true,
      message: "Recent messages fetched Successfully",
      lastAndUnread,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Couldn't fetch recent messages" };
  }
};

module.exports = getLastMessages;
