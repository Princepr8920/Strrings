const bcrypt = require("bcrypt"),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection"),
  { Validation_Error, Service_Error } = require("./handleErrors");

module.exports = class SecurePassword {
  async hashPassword(salt = 10, password) {
    let salted = await bcrypt.genSalt(salt);
    let hashed = await bcrypt.hash(password, salted);
    return hashed;
  }

  async checkPassword(guess, userId) {
    const { password } = await userDb.findOne({
      $or: [
        { email: userId },
        { userID: userId },
        { "tokens.refreshToken": userId },
        { "tokens.requestToken": userId },
      ],
    });

    const isMatched = await bcrypt.compare(guess, password);

    return isMatched;
  }

  async setNewPassword(newPassword, userId) {
    try {
      if (newPassword.length >= 8) {
        const newHashedPassword = await this.hashPassword(10, newPassword);

        let isPassowordChanged = await userDb.findOneAndUpdate(
          {
            $or: [
              { email: userId },
              { userID: userId },
              { "tokens.refreshToken": userId },
              { "tokens.requestToken": userId },
            ],
          },
          { $set: { password: newHashedPassword } }
        );

        if (isPassowordChanged?.value) {
          return {
            success: true,
            message: "Password changed successfully",
          };
        } else {
          throw new Service_Error("Password update error", 500);
        }
      } else {
        throw new Validation_Error("Password update error", 500);
      }
    } catch (error) {
      return error;
    }
  }
};
