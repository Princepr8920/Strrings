const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  { findOneUser, updateUserData } = require("../database/database"),
  passwordService = require("./passwordService"),
  SECURE_PASSWORD = new passwordService(),
  { ObjectID } = require("mongodb");

module.exports = () => {
  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    let currentUser = await findOneUser({ _id: new ObjectID(id) });
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
      const user = await findOneUser({ email });
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
        let counter = user?.user_logs?.visit_logs.length || 0;
        if (checkPassword) {
          await updateUserData(
            { email },
            {
              $push: {
                "user_logs.visit_logs": {
                  visited_on: new Date(),
                  time_spent: "none",
                  visited_count: counter++,
                },
              },
              $set: { last_Visited: new Date() },
            }
          );

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
