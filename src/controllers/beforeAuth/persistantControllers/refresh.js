const jwt = require("jsonwebtoken"),
  createToken = require("../../../service/createToken"),
  Secure = require("../../../utils/filterInfo"),
  SecureInfo = new Secure(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const refresh = async (req, res, next) => {
  const cookies = req.cookies;
  if (cookies?.mng_mode) {
    res.clearCookie("mng_mode", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
  }

  if (!cookies?.strrings_connect && req.user) {
    res.clearCookie("secure_login", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    req.logout((err) => {
      /*  if user two-step-verification is enabled but not 
      completed by user so that server will delete user session
       from server that why we are using req.logout() here
       */ if (err) return err;
    });
    return res
      .status(403)
      .json({ success: false, message: "Your session has expired." });
  }

  const refreshToken = cookies?.strrings_connect;
  let user = null;
  if (refreshToken !== undefined) {
    // if user session cookie (token) found but it is not matched with token stored in db
    user = await userDb.findOne({ "tokens.refreshToken": refreshToken });
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Your session has expired." });
    }
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,

    async (err, decoded) => {
      if (err || user.userID !== decoded.userID) {
        await userDb.updateOne(
          { "tokens.refreshToken": refreshToken },
          {
            $set: {
              "tokens.refreshToken": "",
              "tokens.socketToken": "",
              "tokens.requestToken": "",
            },
          } // remove expired token from db
        );

        return res
          .status(403)
          .json({ success: false, message: "Your session has expired." });
      }

      const payload = { userID: decoded.userID, id: decoded.id };
      const tokens = await createToken({
        user: payload,
        saveToken: [],
        tokenName: ["accessToken"],
        deleteToken: null,
      });
      if (tokens.success) {
        const { accessToken } = tokens.createdTokens;
        const socketToken = user.tokens.socketToken;
        const userWithToken = SecureInfo.filterInfo(user);
        // We are passing socket token along with access token the duration of socket token is similar to refresh token
        return res.status(200).json({
          userWithToken,
          accessToken,
          socketToken,
        });
      } else {
        return next(tokens);
      }
    }
  );
};

module.exports = refresh;
