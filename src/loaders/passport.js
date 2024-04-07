const passport = require("passport"),
  passport_init = passport.initialize(),
  passport_session = passport.session();

module.exports = {
  passport_init,
  passport_session,
};
