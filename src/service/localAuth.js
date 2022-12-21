let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let localUser = require("../models/localModel");

module.exports = () => {
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    let currentUser = await localUser.findOne({ id });
    done(null, currentUser);
  });
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function (email, password, done) {
      localUser.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        } else if (!user) {
          return done(null, false, {
            message: "User not exist",
            status: 404,
            success: false,
          });
        } else {
          user.checkPassword(password, (err, isMatch) => {
            if (err) {
              return err;
            } else if (isMatch) {
              let counter = user.user_logs.visit_logs.length; //// i use this counter variable temporary but when i use mongodb use $inc operator to use this
              user.last_Visited = new Date();
              user.user_logs.visit_logs.push({
                visited_on: new Date(),
                time_spent: "none",
                visited_count: counter++,
              });
              user.save();
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Wrong Password",
                status: 401,
                success: false,
              });
            }
          });
        }
      });
    }
  )
);
