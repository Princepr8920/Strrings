const { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const cancelVerification = async (req, res, next) => {
  try {
    await userDb.deleteOne({
      "tokens.signupToken": req.cookies.welcome_cookies,
    });
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
};

module.exports = cancelVerification;
