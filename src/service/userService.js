const emailSender = require("../service/confirmationCode");
const sendNewEmail = new emailSender();
const { Verificaiton_Error } = require("./handleErrors");
const { setDefaultValues } = require("../models/userSchema"),
  passwordService = require("../service/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  { database, client } = require("../loaders/mongodb"),
  userDb = database("userCollection");

async function addNewUser(info) {
  info.birthday = new Date(info.birthday) // To normalize date object
  const userInfo = { ...info }, // Information that we have gotten from a new user.
    encryptPassword = await SECURE_PASSWORD.hashPassword(10, userInfo.password); // Hash their password    
  userInfo.password = encryptPassword;
  const infoWithDefaultValues = await setDefaultValues(userInfo, client); // create the user object with defaults values and fields
  const savedInfo = await userDb.insertOne(infoWithDefaultValues); // Insert user object to Db
  return savedInfo;
}

async function saveAndVerifyUser(user) {
  try {
    await addNewUser(user);// save new user information to Db
    const emailSent = await sendNewEmail.sendEmail({ // To send verification email.
      email: user.email,
      type: "verify_Account",
      resend: false,
    });

    if (emailSent.success) {
      return emailSent;
    } else {
      throw new Verificaiton_Error("Couldn't verify user", emailSent.status);
    }
  } catch (error) {
    return error;
  }
}

module.exports = saveAndVerifyUser;
