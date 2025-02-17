const jwt = require("jsonwebtoken"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const resetPasswordLink = async (req, res, next) => {
  let { token } = req.params;

  return jwt.verify(token, process.env.JWT_SESSION_SECRET, async (err) => {
    if (err) return res.sendStatus(403); // if jwt token expired, forbidden the request

    try {
      const user = await userDb.findOne({ "tokens.requestToken": token });
      if (user) {
        res.cookie("change_once", token, {
          maxAge: 30 * 60 * 1000,
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        });

        res.cookie("recovery_mode", true, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          maxAge: 30 * 60 * 1000,
        });

        return res
          .status(302)
          .redirect(
            `https://strrings.in/user/passwordrecovery/setnewpassword/${token}`
          );
      } else {
       return res.sendStatus(403);
      }
    } catch (error) {
      next(error);
    }
  });
};

module.exports = resetPasswordLink;
