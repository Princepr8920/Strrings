const { Update_Error } = require("../../../service/handleErrors"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const appearance = async (req, res, next) => {
  let token = req.cookies.strrings_connect;

  try {
    let updatedInfo = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": token },
      { $set: { [`appearance.dark_mode`]: req.body.dark_mode } }
    );

    if (updatedInfo.value) {
      return res.status(200).json({
        success: true,
        message: "Settings updated successfully.",
      });
    } else {
      throw new Update_Error("Settings not updated.", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { appearance };
