let passport = require("passport");
let googleStrategy = require("passport-google-oauth20").Strategy;
let service = require("./user");
let User = require("../models/googleModel");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const currentUser = await User.findOne({ id });
    done(null, currentUser);
  });
};

passport.use(
  new googleStrategy(
    {
      clientID:
        "1027477486418-jbm1fbdvisr5ui2t5mn52ea37spnv8v7.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async function (accesstoken, refreshtoken, profile, done) {
      let id = profile.id,
        username = profile.displayName,
        picture = profile.photos[0].value,
        email = profile.emails[0].value,
        provider = profile.provider,
        joined_At = new Date().toUTCString()

      let currentUser = await service.getUserByEmail({ email });
      if (!currentUser) {
        let newUser = await service.newGoogleUser({
          id,
          username,
          picture,
          email,
          provider,
          joined_At,
        });
        done(null, newUser);
      } else if (currentUser && currentUser.provider !== "google") {
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }
      return done(null, currentUser);
    }
  )
);
