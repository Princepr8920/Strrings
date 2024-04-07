const passport = require("passport"),
  emailSender = require("../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  createToken = require("../service/createToken");

const local_login = async (req, res, next) => {
  passport.authenticate("local", async function (err, user, info) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(info); //  This is an error when invalid password or user not matched
    } else {
      req.login(user, async function (error) {
        if (error) return next(error);
        // This setup is for two-step-verification, if it is enabled
       // req.user = user; //uncomment for testing purpose only

        if (user.security.two_step_verification) {
          try {
            const isEmailSent = await sendNewEmail.twoStepVerification(user);
            if (isEmailSent.success) {
              const tokens = await createToken({
                user,
                saveToken: ["loginToken"],
                tokenName: ["loginToken"],
                deleteToken:null
              });

              if (tokens.success) {
                res.cookie("secure_login", tokens.createdTokens.loginToken, {
                  httpOnly: true,
                  secure: true,
                  sameSite: "strict",
                  maxAge: 30 * 60 * 1000,
                });
                return res.status(202).json(isEmailSent);
              } else {
                next(tokens);
              }
            } else {
              return next(isEmailSent);
            }
          } catch (error) {
            next(error);
          }
        }
        return next();
      });
    }
  })(req, res, next);
};

module.exports = local_login;
