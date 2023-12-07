const Secure = require("../../../utils/filterInfo"),
  SecureInfo = new Secure(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

userSearch = async (req, res) => {
  let { username } = req.query;

  try {
    let users = await userDb
      .find({
        $and: [
          {
            username: {
              $regex: `^${username}`,
              $options: "i",
              $ne: req.user.username,
            },
          },
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
      ];

      const data = SecureInfo.filterInfo(users, exclude);
      return res.status(200).json({ users: data, success: true });
    } else {
      return res
        .status(404)
        .json({ users: [], success: false, message: "No user found." });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = userSearch;
