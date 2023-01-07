const passport = require("passport");

const passport_init = passport.initialize();
const passport_session = passport.session();

module.exports = {
  passport_init,
  passport_session,
};
