const passport = require("passport");
const infoChecker = require("../service/checkExistenceService");
const createUser = require("../service/mongooseService");
const { Signup_Error }  = require("../service/handleErrors");
const setUser = new createUser();
require("dotenv").config();

const local_signup = async (req, res, next) => {
  const userDTO = req.body;
  const userExistenceCheck = new infoChecker(userDTO);
  const data = await userExistenceCheck.userExistance();

  try {
    if (data.success) {
      const user = await setUser.addNewUser(data);
      passport.authenticate("local")(req, res, () => {
        req.user = user;
        next();
      });
    } else {
      throw new Signup_Error("Signup error due to user validation failed", 403);
    }
  } catch (error) {   
    res.status(data.status).send(data);
    next(error);
  }
};

module.exports = local_signup;
