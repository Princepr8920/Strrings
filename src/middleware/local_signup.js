const saveAndVerifyUser = require("../service/userService"),
  passport = require("passport"),
  Secure = require("../utils/filterInfo"),
  SecureInfo = new Secure(),
  { smallLetters } = require("../utils/caseSenstive");

const local_signup = async (req, res, next) => {
  const userDTO = SecureInfo.filterInfo(req.body, ["confirm_password"]); // remove confirm password field because it will not save in DB
  const userObject = smallLetters(userDTO, ["email"]); // To change information in LowerCase

  const isSaved = await saveAndVerifyUser(userObject); // Save user info to db and send a verificaiton email
  if (isSaved.success) {
    passport.authenticate("local")(req, res, () => {
      return next();
    });
  } else {
    return next(isSaved); /// if not success this will be become error
  }
};

module.exports = local_signup;
