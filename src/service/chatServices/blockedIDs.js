const { Validation_Error } = require("../handleErrors"),
  { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection");

async function getBlockedContactsID(userID) {
  try {
    let user = await chatDb.findOne({ userID });
    if (user) {
      return { success: true, blocked: user.blocked_contacts };
    }
    throw new Validation_Error("Something went wrong", 500, false);
  } catch (error) {
    console.error(error);
    return Error;
  }
}

module.exports = getBlockedContactsID;
