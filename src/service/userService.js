const { setDefaultValues } = require("../models/userSchema");
const passwordService = require("../service/passwordService");
const SECURE_PASSWORD = new passwordService();
const { saveToDatabase } = require("../database/database");

async function addNewUser(info) {
  const userInfo = {...info},
    encryptPassword = await SECURE_PASSWORD.hashPassword(10, userInfo.password);
  userInfo.password = encryptPassword;
  const infoWithDefaults = await setDefaultValues(userInfo),
    savedInfo = await saveToDatabase(infoWithDefaults);
  return savedInfo;
}

module.exports = { addNewUser };
