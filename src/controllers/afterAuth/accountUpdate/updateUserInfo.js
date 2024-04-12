const { Update_Error } = require("../../../service/handleErrors"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  chatDb = database("chatCollection"),
  { requestManager } = require("../../../service/requestManager"),
  createToken = require("../../../service/createToken");

const updateUserInfo = async (req, res, next) => {
  try {
    const refreshToken = req?.cookies?.strrings_connect;
    const update = req.body;

    if (update.hasOwnProperty("username")) {
      const user = await userDb.findOne({
        "tokens.refreshToken": refreshToken,
      });

      if (user) {
        let counter = user.user_logs.username_logs.length;

        const updateUserProfile = await userDb.findOneAndUpdate(
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

        if (updateUserProfile.value && updateChatProfile.value) {
          return res.status(200).json({
            success: true,
            message: "Information updated successfully",
          });
        } else {
          throw new Update_Error("Information couldn't be updated!", 500);
        }
      }
    } else {
      const updatedInfo = await userDb.findOneAndUpdate(
        { "tokens.refreshToken": refreshToken },
        { $set: update }
      );
      if (updatedInfo.value) {
        res.status(200).json({
          success: true,
          message: "Information updated successfully",
        });
      } else {
        throw new Update_Error("Information couldn't be updated!", 500);
      }
    }
  } catch (error) {
    return next(error);
  }
};

const updateEmail = async (req, res, next) => {
  const refreshToken = req?.cookies?.strrings_connect;

  try {
    const user = await userDb.findOne({
      "tokens.refreshToken": refreshToken,
    });

    if (user) {
      let isRequestManaged = await requestManager(req.body, user);
      if (!isRequestManaged?.success) {
        throw new Update_Error("Email update failed", 500);
      }

      let token = await createToken({
        user,
        saveToken: ["emailVerificationToken"],
        tokenName: ["emailVerificationToken"],
        deleteToken: null,
      });

      if (token.success) {
        const { emailVerificationToken } = token.createdTokens;

        res.cookie("verify_email", emailVerificationToken, {
          maxAge: 30 * 60 * 1000,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        return res.status(202).json(isRequestManaged);
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

module.exports = { updateUserInfo, updateEmail };
