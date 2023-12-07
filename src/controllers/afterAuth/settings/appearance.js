const { Update_Error } = require("../../../service/handleErrors"),
  { upload, deleteFile } = require("../../../service/awsService"),
  useSharp = require("../../../service/sharpeImgService"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const appearance = async (req, res, next) => {
  let token = req.cookies.strrings_connect;
  let newUpdate = req.body;

  try {
    let [key, value] = [Object.keys(newUpdate), Object.values(newUpdate)];
    let updatedInfo = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": token },
      { $set: { [`appearance.${key[0]}`]: value[0] } },
      {
        // It return the document before update but it update the document
        returnDocument: "before",
      }
    );

    if (updatedInfo.value) {
      let bg = updatedInfo.value?.appearance?.background;
      if (bg?.custom_bg && bg?.bg_type === "image") {
        await deleteFile([bg?.current_bg]); // To delete current avatar from aws storage
      }
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

const customBackground = async (req, res, next) => {
  let token = req.cookies.strrings_connect;
  let update = req.body;
  let image = req.file;

  try {
    let resizedImage = await useSharp(image, {
      background: {
        width: null,
        height: null,
      },
    }); // To resize the image

    let uploadImg = await upload(resizedImage?.imgInDifferentSizes, "");
    update.custom_bg = true;

    if (resizedImage.success && uploadImg.success) {
      let updatedBg = {
        ...update,
        current_bg: `${process.env.CLOUDFRONT_URL}/background/${image.originalname}`,
      };

      let updatedInfo = await userDb.findOneAndUpdate(
        { "tokens.refreshToken": token },
        {
          $set: {
            "appearance.background": updatedBg,
          },
        },
        {
          // It return the document before update but it update the document
          returnDocument: "before",
        }
      );

      if (updatedInfo) {
        await deleteFile([
          updatedInfo.value?.appearance?.background?.current_bg,
        ]); // To delete current avatar from aws storage
        return res.status(200).json({
          updatedBg,
          success: true,
          message: "Settings updated successfully.",
        });
      }
    } else {
      throw new Update_Error("Settings not updated.", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { appearance, customBackground };
