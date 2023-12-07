const multer = require("multer");
const upload = multer();

const conditionalMulter = function (fieldname, type) {
  return function (req, res, next) {
    upload.single(fieldname)(req, res, (err) => {
      let file = req.file;
      // To validate filetype and fieldname
      if (type.includes(file.mimetype) && fieldname === file.fieldname) {
        let extension = `.${req.file.originalname.match(/(\w+)$/g)[0]}`;
        req.file.originalname =
          fieldname + "-" + req.user.userID + "--" + Date.now() + extension;
        if (err instanceof multer.MulterError) {
          // Handle Multer errors (e.g., file size exceeded limit)
          console.error(err);
          res.status(400).json({
            message: "File couldn't be uploaded",
            success: false,
          });
        } else if (err) {
          // Handle other errors
          console.error(err);
          return res
            .status(500)
            .json({ message: "Internal server error", success: false });
        } else {
          // File successfully uploaded, proceed to the next middleware
          next();
        }
      } else {
        console.error({ success: false, message: "Incompatible file" });
        return res
          .status(400)
          .json({ success: false, message: "Incompatible file" });
      }
    });
  };
};

module.exports = conditionalMulter;
