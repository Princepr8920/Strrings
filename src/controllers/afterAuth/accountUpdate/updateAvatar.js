const { deleteFile } = require("../../../service/awsService");
const { Update_Error } = require("../../../service/handleErrors");
const upload = require("../../../service/saveAvatar"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const updateAvatar = async (req, res, next) => {
  let saveImage = await upload(req.file);
  let token = req.cookies.strrings_connect;
  if (saveImage.success) {
    try {
      let picture = saveImage.avatar;
      let updatedInfo = await userDb.findOneAndUpdate(
        { "tokens.refreshToken": token },
        { $set: { picture } },
        {
          returnDocument: "before", // It update the user object but return the user object before update
        }
      );
      if (updatedInfo) {
        await deleteFile([updatedInfo.value?.picture]); // To delete current avatar from aws storage
        return res.status(200).json({
          updatedAvatar: picture.replace(/small+/g, "large"),
          success: true,
          message: "Avatar updated successfully.",
        });
      } else {
        throw new Update_Error("Couldn't update avatar", 500);
      }
    } catch (error) {
      return next(error);
    }
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};

const getAvatar = async (req, res, next) => {
  try {
    let avatar = req.user.picture.replace(/small+/g, "large");
    res.status(200).json({ avatar, success: true, message: "your avatar" });
  } catch (error) {
    return next(error);
  }
};

const getContactAvatar = async (req, res, next) => {
  try {
    let picture = req.query["user-avatar"].replace(/small+/g, "large");
    res
      .status(200)
      .json({ avatar: picture, success: true, message: "Here's user avatar" });
  } catch (error) {
    return next(error);
  }
};

const removeAvatar = async (req, res, next) => {
  let token = req.cookies.strrings_connect;

  try {
    if (!req.user.picture.includes("user_default_avatar.jpg")) {
      let user = await userDb.findOneAndUpdate(
        { "tokens.refreshToken": token },
        {
          $set: {
            picture: `${process.env.CLOUDFRONT_URL}/avatars/small/user_default_avatar.jpg`,
          },
        },
        {
          returnDocument: "before", // It update the user object but return the user object before update
        }
      );

      if (user.value) {
        await deleteFile([user.value?.picture]); // To delete current avatar from aws storage
        return res.status(200).json({
          user_default_avatar: `${process.env.CLOUDFRONT_URL}/avatars/small/user_default_avatar.jpg`,
          success: true,
          message: "Avatar removed successfully",
        });
      } else {
        throw new Update_Error("Couldn't remove default avatar", 500);
      }
    } else {
      throw new Update_Error("Couldn't remove default avatar", 400);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  updateAvatar,
  getAvatar,
  removeAvatar,
  getContactAvatar,
};
