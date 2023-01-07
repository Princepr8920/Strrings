const bcrypt = require("bcrypt");
const { findOneUser, updateUserData } = require("../database/database");
const { Validation_Error } = require("./handleErrors");

module.exports = class SecurePassword {
  async hashPassword(salt = 10, password) {
    let salted = await bcrypt.genSalt(salt);
    let hashed = await bcrypt.hash(password, salted);
    return hashed;
  }

  async checkPassword(guess, userId) {
    const { password } = await findOneUser(
      [{ email: userId }, { userID: userId }, { refreshToken: userId }],
      "$or"
    );
    const isMatched = await bcrypt.compare(guess, password);
    return isMatched;
  }

  async setNewPassword(newPassword, userId) {
    try {
      if (newPassword.length >= 8) {
        const newHashedPassword = await this.hashPassword(10, newPassword);
        const updatedInfo = await updateUserData(
          [{ email: userId }, { userID: userId }, { refreshToken: userId }],
          { $set: { password: newHashedPassword } },
          "$or"
        );
        return {
          success: true,
          message: "Password changed successfully",
          user: updatedInfo,
        };
      } else {
        throw new Validation_Error("Password update error", 500);
      }
    } catch (error) {
      return error;
    }
  }
};
