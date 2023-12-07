const { Update_Error } = require("../handleErrors"),
  { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection");

const unblockUser = async ({ contactID, userID }) => {
  try {
    let isRemovedFromContacts = await chatDb.updateOne(
      { userID },
      { $pull: { contacts: contactID } }
    );

    if (isRemovedFromContacts.modifiedCount) {
      return {
        contactID,
        message: "User removed!",
        success: true,
      };
    } else {
      throw new Update_Error("User couldn't be removed, try again", 500);
    }
  } catch (error) {
    console.error(error);
    return { message: "User couldn't be removed, try again", success: false };
  }
};

module.exports = unblockUser;
