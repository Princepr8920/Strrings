const { Validation_Error } = require("../../../service/handleErrors"),
  { database } = require("../../../loaders/mongodb"),
  chatDb = database("chatCollection");

blockedContacts = async (req, res, next) => {
  try {
    let getBlockedContacts = await chatDb.findOne({ userID: req.user.userID });
    if (getBlockedContacts) {
      let { blocked_contacts } = getBlockedContacts;

      if (!blocked_contacts.length) {
        // If blocked_contacts is an empty array so taht return it immedately
        return res.status(200).json({ blocked_contacts, success: true });
      }

      const aggregationPipeline = [
        {
          $match: { userID: { $in: blocked_contacts } }, // Match multiple users by their IDs
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
      ];

      const blockedContactsArray = await userDb
        .aggregate(aggregationPipeline)
        .toArray();

      return res
        .status(200)
        .json({ blocked_contacts: blockedContactsArray, success: true });
    } else {
      throw new Validation_Error("Something went wrong!", 500);
    }
  } catch (error) {
    error = { ...error, message: "Couldn't fetch blocked users" };
    next(error);
  }
};

module.exports = blockedContacts;
