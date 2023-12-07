const { Update_Error } = require("../../../service/handleErrors"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  chatDb = database("chatCollection"),
  { requestManager } = require("../../../service/requestManager"),
  createToken = require("../../../service/createToken");
 
const updateEmailAndUsername = async (req, res, next) => {
  const update = req.body,
    refreshToken = req.cookies?.strrings_connect,
    user = await userDb.findOne({ "tokens.refreshToken": refreshToken });
  try {
    if (user) {
      let isEmailRequest = null;
      if (update.hasOwnProperty("email")) {
        let isRequestManaged = await requestManager(update, user);
        if (!isRequestManaged?.success) {
          throw new Update_Error("Email update failed", 500);
        }
        isEmailRequest = isRequestManaged;
        delete update.email; /// delete this property because email will be verify and update rest property

        if (!Object.keys(update).length) {
          let token = await createToken({
            user,
            saveToken: ["emailVerificationToken"],
            tokenName: ["emailVerificationToken"],
            deleteToken:null
          });

          if (token.success) {
            const { emailVerificationToken } = token.createdTokens;

            res.cookie("verify_email", emailVerificationToken, {
              maxAge: 30 * 60 * 1000,
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            });
            return res.status(202).json(isEmailRequest);
          } else {
            throw new Update_Error("Couldn't update information", 500);
          }
        }
      }
      let counter = user.user_logs.username_logs.length;
      const updateSuccess = await userDb.findOneAndUpdate(
        { userID: user.userID },
        {
          $set: update,
          $push: {
            // update username logs
            "user_logs.username_logs": {
              username: update.username,
              updated_on: new Date(),
              update_count: counter++,
            },
          },
        },
        {
          returnDocument: "after",
        }
      );

      const updateChatProfile = await chatDb.findOneAndUpdate(
        { userID: user.userID },
        { $set: { username: update.username } },
        { returnDocument: "after" }
      );

      if (updateSuccess.value && updateChatProfile.value) {
        if (isEmailRequest) {
          let token = await createToken({
            user,
            saveToken: ["emailVerificationToken"],
            tokenName: ["emailVerificationToken"],
            deleteToken:null
          });

          if (token.success) {
            const { emailVerificationToken } = token.createdTokens;

            res.cookie("verify_email", emailVerificationToken, {
              maxAge: 30 * 60 * 1000,
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            });
            return res
              .status(202)
              .json({
                isEmailRequest,
                updated: { username: updateSuccess.value.username },
              });
          } else {
            throw new Update_Error("Couldn't update information", 500);
          }
        } else {
          return res.status(200).json({
            updated: { username: updateSuccess.value.username },
            success: true,
            message: "Information updated successfully",
          });
        }
      } else {
        throw new Update_Error("Couldn't update information", 500);
      }
    } else {
      throw new Update_Error("Couldn't update information", 500);
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = updateEmailAndUsername;
