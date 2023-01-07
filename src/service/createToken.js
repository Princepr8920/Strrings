const jwt = require("jsonwebtoken");
const { updateUserData } = require("../database/database");


module.exports = class TokenMachine {
  async setToken(user, saveToken = []) {
    const payload = { userID: user.userID, id: user._id };

    const tokens = {
      accessToken: jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "1h",
      }),
      refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
      }),
      requestsToken: jwt.sign(payload, process.env.JWT_SESSION_SECRET, {
        expiresIn: "30m",
      }),
      securityToken: jwt.sign(payload, process.env.JWT_SESSION_SECRET, {
        expiresIn: "2h",
      }),
    };

    const saveTokenToDatabase = {};

    for (let i = 0; i < saveToken.length; i++) {
      if (
        saveToken[i] === "refreshToken" ||
        saveToken[i] === "requestsToken" ||
        saveToken[i] === "securityToken"
      ) {
        saveTokenToDatabase[saveToken[i]] = tokens[saveToken[i]];
      }
    }

    await updateUserData(
      { userID: user.userID },
      { $set: saveTokenToDatabase }
    );
    return tokens;
  }
};
