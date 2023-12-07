const Secure = require("../../../utils/filterInfo"),
  SecureInfo = new Secure(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

getAllUsers = async (req, res) => {
  try {
    let users = await userDb
      .find({
        $and: [
          { username: { $ne: req.user.username } },
          { verification: true },
        ],
      })
      .toArray();

    if (users.length) {
      let exclude = [
        "__v",
        "_id",
        "email",
        "password",
        "provider",
        "date_of_birth",
        "confirmationCode",
        "verification",
        "security",
        "notifications",
        "userRequests",
        "user_logs",
        "appearance",
        "tokens",
        "feedback",
        "events"
      ];
      const data = SecureInfo.filterInfo(users, exclude);
      return res.status(200).json({ users: data, success: true });
    } else {
      return res
        .status(404)
        .json({ users: [], success: false, message: "No contacts found." });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = getAllUsers;
