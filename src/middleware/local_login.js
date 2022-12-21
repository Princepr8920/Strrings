const passport = require("passport");
const { Identification_Error } = require("../service/handleErrors");
require("dotenv").config();

const local_login = (req, res, next) => { 
  passport.authenticate("local", async function (err, user, info) {
    if (err) {
      return err;
    } else if (!user) {
      try {
        throw new Identification_Error(info.message, info.status);
      } catch (error) {
        res.status(info.status).json(info);
        next(error);
      }
    } else {
      req.login(user, function (error) {
        if (error) return next(error);
        req.user = user;
        next();
      });
    }
  })(req, res, next);
};

module.exports = local_login;
