const {
  Verificaiton_Error,
  Validation_Error,
} = require("../service/handleErrors");
const jwt = require("jsonwebtoken"),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection");

const verifyTaskToken = async (req, res, next) => {
  const getCookies = req.cookies;
  const path = req.path;

  const pathWithCookie = {
    change_once: [
      [`/user/password/setnewpassword/${getCookies?.change_once}`],
      "requestsToken",
    ],
    welcome_cookies: [
      [
        "/verify-user-account",
        "/resend-account-verification-code",
        "/cancel-verification",
      ],
      "signupToken",
    ],
    mng_mode: [["/api/delete/user-account"], "securityToken"],
    secure_login: [
      ["/resend-2-step-verification-code", "/two-step-verification"],
      "loginToken",
    ],
    verify_email: [
      ["/api/user/email/verification/done", "/api/user/email/verificaiton/resend"],
      "emailVerificationToken",
    ],
  };

  const token = [];

  for (let key in getCookies) {
    if (
      pathWithCookie.hasOwnProperty(key) &&
      pathWithCookie[key][0].includes(path)
    ) {
      token[0] = [pathWithCookie[key][1], getCookies[key]];
    }
  }

  try {
    if (token.length) {
      const isExistInDb = await userDb.findOne({
        [`tokens.${token[0][0]}`]: token[0][1],
      });

      if (!isExistInDb) {
        throw new Verificaiton_Error("Forbidden", 403);
      } else {
        jwt.verify(
          token[0][1],
          process.env.JWT_SESSION_SECRET,
          (err, decoded) => {
            if (err) return res.sendStatus(403);
            req.userId = decoded.email;
            return next();
          }
        );
      }
    } else {
      throw new Validation_Error("Forbidden", 403);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = verifyTaskToken;
