const { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  chatDb = database("chatCollection");

const deleteAccount = async (req, res, next) => {
  const token = req.cookies.mng_mode;

  try {
    let deleteUserAccount = await userDb.deleteOne({
      "tokens.securityToken": token,
    });

    if (deleteUserAccount.deletedCount) {
      await chatDb.deleteOne({ userID: req.user.userID });
      res.clearCookie("strrings_connect", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.clearCookie("mng_mode", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res
        .status(200)
        .json({ message: "Account deleted successfully", success: true });
    } else {
      throw new Error("Something went wrong", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = deleteAccount;
