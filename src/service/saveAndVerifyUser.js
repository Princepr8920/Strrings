const emailSender = require("../service/confirmationCode");
const sendNewEmail = new emailSender();
const { addNewUser } = require("../service/userService");
const { Verificaiton_Error } = require("./handleErrors");

module.exports = async function saveAndVerifyUser(user) {
  try {
    await addNewUser(user);
    const emailSent = await sendNewEmail.sendEmail(
      "",
      user.email,
      "Account verification",
      false
    ); 
    if (emailSent.success) {
      return emailSent;
    } else {
      throw new Verificaiton_Error("Couldn't verify user", emailSent.status);
    }
  } catch (error) {
    return error;
  }
};
