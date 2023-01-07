const passport = require("passport");
const { Validation_Error } = require("../service/handleErrors");
require("dotenv").config();

const local_login = (req, res, next) => { 
  passport.authenticate("local", async function (err, user, info) {
    if (err) {
      return err;
    } else if (!user) {
      try {
        throw new Validation_Error(info.message, info.status);
      } catch (error) {
       return next(error);
      }
    } else {
      req.login(user, function (error) {
        if (error) return next(error);
        req.user = user;
       return next();
      });
    }
  })(req, res, next);
};

module.exports = local_login;
