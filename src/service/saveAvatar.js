const { Service_Error } = require("./handleErrors");
const useSharp = require("./sharpeImgService"),
  { upload } = require("./awsService");

async function imageSaver(image) {
  try {
    let resizedImages = await useSharp(image, {
      small: { width: 48, height: 48 },
      large: {
        width: null,
        height: null,
      },
    }); // To resize the image in multiple sizes
    let isUploaded = await upload(
      resizedImages?.imgInDifferentSizes,
      "avatars"
    );

    if (resizedImages.success && isUploaded.success) {
      return {
        avatar: `${process.env.CLOUDFRONT_URL}/avatars/small/${resizedImages.imgInDifferentSizes.small.originalname}`,
        success: true,
        message: "Avatar updated successfully",
      };
    } else {
      throw new Service_Error("Couldn't update avatar", 500, false);
    }
  } catch (error) {
    return error;
  }
}

module.exports = imageSaver;
