const bcrypt = require("bcrypt");
const localUser = require("../models/localModel");
const { Validation_Error } = require("./handleErrors");


///  things are repeated in this module please check again and optimize it

module.exports = class SecurePassword {
  async hashPassword(salt, password) {
    let salted = await bcrypt.genSalt(salt);
    let hashed = await bcrypt.hash(password, salted);
    return hashed;
  }

  async checkPassword(guess, userID) {
    const { password } = await localUser.findOne({ userID }).lean();
    const isMatched = await bcrypt.compare(guess, password);
    return isMatched;
  }

  async setNewPassword(passwords, userID) {
    const { current_password, new_password, confirm_password } = passwords;
    const isMatched = await this.checkPassword(current_password, userID);
    const sameAsPrevious = await this.checkPassword(new_password, userID);
    try {
      if (!isMatched) {
        throw new Validation_Error("Invalid password", 401);
      } else if (new_password !== confirm_password) {
        throw new Validation_Error("Passwords do not match.", 401);
      } else if (new_password.length < 8) {
        throw new Validation_Error(
          "Use 8 or more characters with a mix of letters, numbers, and symbols.",
          401
        );
      } else if (sameAsPrevious) {
        throw new Validation_Error("Previous passwords cannot be reused.", 401);
      } else {
        const hashedNewPassword = await this.hashPassword(10, new_password); 
        const updatedInfo = await localUser.findOneAndUpdate(
          userID,
          { password: hashedNewPassword },
          {
            new: true,
          }
        );
 
        return {
          success: true,
          message: "Password changed successfully",
          status: 200,
          user: updatedInfo,
        };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message, status: error.status };
    }
  }
};
