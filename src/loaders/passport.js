const passport = require("passport");
const localAuth = require("../service/localAuth");

const passport_init = passport.initialize();
const passport_session = passport.session();

localAuth();

module.exports = {
  passport_init,
  passport_session,
};
