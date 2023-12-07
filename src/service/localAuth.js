const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection"),
  passwordService = require("./passwordService"),
  SECURE_PASSWORD = new passwordService(),
  { ObjectID } = require("mongodb");

module.exports = () => {
  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    let currentUser = await userDb.findOne({ _id: new ObjectID(id) });
    done(null, currentUser);
  });
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      const user = await userDb.findOne({ email });
      if (!user) {
        return done(null, false, {
          message: "User not exist",
          status: 404,
          success: false,
        });
      } else {
        const checkPassword = await SECURE_PASSWORD.checkPassword(
          password,
          email
        );

        if (checkPassword) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: "Wrong Password",
            status: 401,
            success: false,
          });
        }
      }
    }
  )
);
