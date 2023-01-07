const saveAndVerifyUser = require("../service/saveAndVerifyUser"),
  passport = require("passport"),
  Secure = require("../utils/filterInfo"),
  SecureInfo = new Secure();
const local_signup = async (req, res, next) => {
  const userDTO = SecureInfo.filterInfo(req.body, ["confirm_password"]);
  const isSaved = await saveAndVerifyUser(userDTO);
  if (isSaved.success) {
    passport.authenticate("local")(req, res, () => {
      return next();
    });
  } else {
    return next(isSaved); /// if not success this become error
  }
};

module.exports = local_signup;
