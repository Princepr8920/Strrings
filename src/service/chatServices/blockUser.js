const { Update_Error } = require("../handleErrors"),
  { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection"),
  userDb = database("userCollection");

const blockUser = async ({ contactID, userID }) => {
  try {
    const aggregationPipeline = [
      {
        $match: { userID: contactID }, // Match the specific user by userID
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          username: 1,
          email: 1,
          picture: 1,
          userID: 1,
          about: 1,
          status: 1,
          last_seen: 1,
          joined_at: 1,
          first_name: 1,
          last_name: 1,
        },
      },
    ];

    const getContactInfo = await userDb
      .aggregate(aggregationPipeline)
      .toArray();
    if (getContactInfo[0]) {
      const update = await chatDb.updateOne(
        {
          userID,
          blocked_contacts: {
            $nin: [contactID],
          },
        },
        { $push: { blocked_contacts: contactID } }
      );

      if (!update.modifiedCount) {
        throw new Update_Error("User couldn't be blocked");
      }

      return {
        blockedUser: getContactInfo[0],
        message: "User blocked",
        success: true,
      };
    } else {
      throw new Update_Error("User couldn't be blocked");
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};

const unblockUser = async ({ contactID, userID }) => {
  try {
    let isUnblocked = await chatDb.updateOne(
      { userID },
      { $pull: { blocked_contacts: contactID } }
    );

    if (isUnblocked.modifiedCount) {
      return {
        contactID,
        message: "User unblocked!",
        success: true,
      };
    } else {
      throw new Update_Error("User couldn't be unblocked, try again");
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};

module.exports = { blockUser, unblockUser };
