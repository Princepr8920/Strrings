const jwt = require("jsonwebtoken"),
  { Service_Error } = require("../service/handleErrors"),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection");

async function createToken(options) {
  const { user, saveToken, tokenName, deleteToken } = options,
    // saveToken and tokenName are type of array to save and create multiple tokens
    //  deleteToken is type of object

    payloadWithId = { userID: user?.userID, id: user?._id },
    payloadWithoutId = { userID: user?.email, id: user?._id },
    durations = {
      accessToken: "12h",
      refreshToken: "7d",
      requestToken: "30m",
      emailVerificationToken: "30m",
      signupToken: "30m",
      securityToken: "30m",
      loginToken: "30m",
      socketToken: "7d",
    };

  try {
    let createdTokens = {};

    for (let key in durations) {
      let beforeAuth = ["signupToken", "loginToken"];
      let tokenType = key.includes("refresh")
        ? "JWT_REFRESH_SECRET"
        : key.includes("access")
        ? "JWT_ACCESS_SECRET"
        : "JWT_SESSION_SECRET";

      if (tokenName.includes(key) && !beforeAuth.includes(key)) {
        createdTokens[key] = jwt.sign(payloadWithId, process.env[tokenType], {
          expiresIn: durations[key],
        });
      } else if (beforeAuth.includes(tokenName[0])) {
        createdTokens[tokenName] = jwt.sign(
          payloadWithoutId,
          process.env[tokenType],
          {
            expiresIn: durations[key],
          }
        );
      }
    }

    let tokensKeys = Object.keys(createdTokens);

    if (tokensKeys.length !== tokenName.length) {
      let thisTokens = "";

      tokenName.filter((e) => {
        if (!tokensKeys.includes(e)) {
          thisTokens = e + "," + thisTokens;
        }
        return thisTokens;
      });

      throw new Service_Error(`${thisTokens} are not created 🔐`, 500);
    }

    if (saveToken.length) {
      let tokenObj = user.tokens || {}; // To get already saved tokens
      let save = {};
      for (let key in createdTokens) {
        if (saveToken.includes(key)) {
          save[key] = createdTokens[key];
        }
      }

      let savedTokensKeys = Object.keys(save);

      if (savedTokensKeys.length !== saveToken.length) {
        let thisTokens = "";
        saveToken.filter((e) => {
          if (!savedTokensKeys.includes(e)) {
            thisTokens = e + "," + thisTokens;
          }
          return thisTokens;
        });
        throw new Service_Error(`${thisTokens} are not saved 💽`, 500, false);
      }

      let allTokens = deleteToken
        ? { ...tokenObj, ...deleteToken, ...save }
        : { ...tokenObj, ...save };

      let userWithToken = await userDb.findOneAndUpdate(
        { email: user.email },
        { $set: { tokens: allTokens } },
        {
          returnDocument: "after",
        }
      );
      if (userWithToken.value) {
        return { createdTokens, userWithToken, success: true };
      }
      throw new Service_Error(`${thisTokens} are not saved 💽`, 500, false);
    } else if (deleteToken) {
      let deleteTokens = await userDb.findOneAndUpdate(
        { email: user.email },
        { $set: { tokens: { ...tokenObj, ...deleteToken } } },
        {
          returnDocument: "after",
        }
      );
      if (deleteTokens.value) {
        return { createdTokens, userWithToken: deleteTokens, success: true };
      }
      throw new Service_Error(`${thisTokens} are not saved 💽`, 500, false);
    }

    return { createdTokens, userWithToken: null, success: true };
  } catch (error) {
    return error;
  }
}

module.exports = createToken;
