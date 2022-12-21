const sendConfirmationEmail = require("../service/mailer");
const { Signup_Error } = require("../service/handleErrors");


module.exports = class ResetPassword{

async sendEmail(username, email) {
  let confirmationCode = this.#RandomDigit();
  let getUser = await localUser.findOne({
    $or: [{ email: email }, { username: username }],
  });
  try {
    if (getUser) {
      getUser.confirmationCode = confirmationCode;
      await getUser.save(); // focus
      sendConfirmationEmail(username, email, confirmationCode);
    } else {
      throw new Signup_Error("User not found", 404);
    }
  } catch (error) {
    console.error(error);
  }
}

}

 