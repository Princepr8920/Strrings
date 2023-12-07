const Secure = require("../../../utils/filterInfo"),
  SecureInfo = new Secure(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const getUserProfile = async (req, res, next) => {
  let { userID } = req.params;
  try {
    let user = await userDb.findOne({ userID });
    if (user) {
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
      const data = SecureInfo.filterInfo(user, exclude);
      return res.status(200).json({ user: data, success: true });
    } else {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = getUserProfile;
