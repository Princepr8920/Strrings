const { Service_Error } = require("./handleErrors"),
  useSharp = require("./sharpeImgService"),
  { upload } = require("./awsService");

async function imageSaver(image) {
  try {
    let resizedImages = await useSharp(image, {
      small: { width: 48, height: 48 },
      large: {
        width: 512,
        height: 512,
      },
      //we can use { width: null, height: null } if we want to save image in original size
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
