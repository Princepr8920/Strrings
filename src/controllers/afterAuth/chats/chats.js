const { Validation_Error } = require("../../../service/handleErrors");
const { database } = require("../../../loaders/mongodb"),
  chatDb = database("chatCollection");

getAllUsers = async (req, res, next) => {
  try {
    const getContacts = await chatDb.findOne({ username: req.user.username });

    if (getContacts) {
      let { blocked_contacts, contacts } = getContacts;

      // To filter out the blocked contact from all contacts
      for (let i = 0, len = blocked_contacts.length; i < len; i++) {
        if (contacts.includes(blocked_contacts[i])) {
          let index = contacts.indexOf(blocked_contacts[i]);
          contacts.splice(index, 1);
        }
      }

      const aggregationPipeline = [
        {
          $match: { userID: { $in: contacts } }, // Match multiple users by their IDs
        },
        {
          $project: {
            _id: 0,
            username: 1,
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
        {
          $sort: {
            last_seen: -1, // Use -1 for descending order, 1 for ascending
          },
        },
      ];

      const contactArray = await userDb
        .aggregate(aggregationPipeline)
        .toArray();

      return res.status(200).json({ contacts: contactArray, success: true });
    } else {
      throw new Validation_Error("Something went wrong!", 500);
    }
  } catch (error) {
    error = {...error,message:"Couldn't fetch user chats"}
    return next(error);
  }
};

module.exports = getAllUsers;
