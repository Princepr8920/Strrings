const { formatDate } = require("../../../utils/userAge");
const { Update_Error } = require("../../../service/handleErrors"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  filterInstance = require("../../../utils/filterInfo"),
  FILTER = new filterInstance();

const updateUserInfo = async (req, res, next) => {
  try {
    const update = req.body,
      refreshToken = req?.cookies?.strrings_connect;
    update.birthday = new Date(update.birthday);
    let updatedInfo = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": refreshToken },
      { $set: update },
      {
        returnDocument: "after",
      }
    );

    if (updatedInfo.value) {
      const user = FILTER.filterInfo(updatedInfo.value);
      user.birthday = formatDate(new Date(user.birthday));
      res.status(200).json({
        user,
        success: true,
        message: "Information updated successfully",
      });
    } else {
      throw new Update_Error("Information couldn't be updated!", 500);
    }
  } catch (error) {
    return next(error);
  }
};
module.exports = updateUserInfo;
