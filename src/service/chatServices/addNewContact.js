const { Update_Error } = require("../handleErrors");
const { database } = require("../../loaders/mongodb"),
  chatDb = database("chatCollection"),
  userDb = database("userCollection");

const addNewContact = async ({ contactID, userID }) => {
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
      let addToContacts = await chatDb.findOneAndUpdate(
        {
          userID,
          contacts: {
            $nin: [contactID],
          },
        },
        {
          $push: { contacts: contactID },
        },
        {
          returnDocument: "after",
        }
      );

      if (!addToContacts.value) {
        throw new Update_Error(
          "Contact couldn't be saved."
        ); /* we are only define message for error in all socket related events.
         But nevertheless errors also return status that is OK */
      }

      return {
        contact: getContactInfo[0],
        message: "Contact saved.",
        success: true,
      };
    } else {
      throw new Update_Error("Contact couldn't be saved.");
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Contact couldn't be saved." };
  }
};

module.exports = addNewContact;
