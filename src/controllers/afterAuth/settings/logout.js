const { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const logout = async function (req, res, next) {
  const refreshToken = req.cookies?.strrings_connect;

  try {
    if (!refreshToken) {
      return res.sendStatus(403);
    }

    res.clearCookie("strrings_connect", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.clearCookie("change_once", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.clearCookie("mng_mode", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.clearCookie("verify_email", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.clearCookie("connect.sid", {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
    });

    await userDb.updateOne(
      { "tokens.refreshToken": refreshToken },
      {
        $set: {
          "tokens.refreshToken": "",
          "tokens.socketToken": "",
          "tokens.emailVerificationToken": "",
          "tokens.requestToken": "",
          "tokens.securityToken": "",
          userRequests: {},
          confirmationCode: {},
        },
      }
    );

    return req.logout((err) => {
      if (err) return err;

      console.log(req.isAuthenticated(), "User logout successfully 🚫");
      return res.sendStatus(204);
    });
  } catch (error) {
    next(error);
  }
};

module.exports = logout;
