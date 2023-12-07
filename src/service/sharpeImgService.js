const sharp = require("sharp");

function resizeImage(image, sizes) {
  let name = image.originalname.replace(/\.+\w+$/, "");
  let resizedImages = [];

  for (let size in sizes) {
    const resized = sharp(image.buffer)
      .resize(sizes[size])
      .toFormat("jpg")
      .toBuffer();
    resizedImages.push(resized);
  }

  const success = Promise.all(resizedImages)
    .then((data) => {
      let imgInDifferentSizes = {};
      let allSizes = Object.keys(sizes);

      for (let i = 0, len = data.length; i < len; i++) {
        if (allSizes.length > 1) { // if multiple sizes available
          data[i].originalname = `${allSizes[i]}-${name}.jpg`;
        } else {
          data[i].originalname = `${name}.jpg`;
        }
        data[i].mimetype = image.mimetype.replace(/[^\/][\w]+$/i, "jpg");
        imgInDifferentSizes[allSizes[i]] = data[i];
      }

      let result = {
        success: true,
        message: "Image resized successfully.",
        imgInDifferentSizes,
      };

      return result;
    })
    .catch((err) => {
      console.error(err);
      return err;
    });

  return success;
}

module.exports = resizeImage;
