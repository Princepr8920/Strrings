const { findOneUser } = require("../database/database"),
  { body, validationResult } = require("express-validator"),
  passwordService = require("../service/passwordService"),
  SECURE_PASSWORD = new passwordService();

const updateDifferentSection = (reqObj, fieldName,con) => {
  if (
    (reqObj.url === "/signup" || reqObj.url === "/user/profile/edit") &&
    fieldName.length < 3
  ) {
    return true;
  } else {
    return false;
  }
};

const dataValidationRules = [
  body("first_name")
    .if((value, { req }) => updateDifferentSection(req, value))
    .isLength({ min: 3, max: 20 })
    .withMessage("Firstname should be minimum 3 and maximum 20 characters")
    .trim(),

  body("last_name")
  .if((value, { req }) => req.body.last_name)
    .isLength({ max: 20 })
    .withMessage("Lastname should be maximum 20 characters")
    .trim(),

  body("username")
  .if((value, { req }) => updateDifferentSection(req, value))
    .isLength({ min: 3, max: 20 })
    .withMessage("Username should be minimum 3 and maximum 30 characters")
    .matches(/^\w+$/)
    .withMessage(
      "Username can only use letters, numbers, underscores and periods."
    )
    .custom(async (value, { req }) => {
      const isUsernameAvailable = await findOneUser({ username: value });
      if (isUsernameAvailable) {
        throw new Error("That username is taken. Try another.");
      }
      return true;
    }),

  body("email")
  .if((value, { req }) => updateDifferentSection(req, value))
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const isEmailAvilable = await findOneUser({ email: value });
      if (isEmailAvilable) {
        throw new Error(
          "This email address is not available. Choose a different address."
        );
      }
      return true;
    }),

  body("password")
    .if((value, { req }) => req.body.password)
    .isLength({ min: 8, max: 40 })
    .withMessage(
      "Use 8 or more characters with a mix of letters, numbers, and symbols."
    )
    .matches(/\d+/)
    .withMessage("Your password should have at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]+/)
    .withMessage("Your password should have at least one special character"),

  body("new_password")
    .if((value, { req }) => req.body.new_password || req.body.current_password)
    .custom(async (value, { req }) => {
      if (value !== undefined) {
        const sameAsPrevious = await SECURE_PASSWORD.checkPassword(
          value,
          req.cookies.user_session
        );
        if (sameAsPrevious) {
          throw new Error("Previous passwords cannot be reused.");
        }
      } else {
        throw new Error("Please enter your new password.");
      }
      return true;
    })
    .if((value, { req }) => req.body.new_password)
    .isLength({ min: 8, max: 40 })
    .withMessage(
      "Use 8 or more characters with a mix of letters, numbers, and symbols."
    )
    .matches(/\d+/)
    .withMessage("Your new password should have at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]+/)
    .withMessage(
      "Your new password should have at least one special character"
    ),

    
  body("current_password")
    .if((value, { req }) => req.body.current_password)
    .custom(async (value, { req }) => {
      const isMatched = await SECURE_PASSWORD.checkPassword(
        value,
        req.cookies.user_session
      );
      if (!isMatched) {
        throw new Error("Invalid password");
      } else {
        return true;
      }
    }),

  body("confirm_password")
    .if((value, { req }) => req.body.password || req.body.new_password)
    .custom((value, { req }) => {
      if (value === undefined) {
        throw new Error("Please reconfirm your password.");
      } else if (
        (value !== req.body.new_password && req.url === "/user/profile/edit") ||
        (value !== req.body.password && req.url === "/signup")
      ) {
        throw new Error("Confirm password does not match");
      }
      return true;
    }),
];

// Using special characters, other than ~!@#$%^&*-_+=|";[]{}()<>,./?\, is not allowed.
// Use 8 or more characters with a mix of letters, numbers, and symbols.
// Can't include more than 3 repeated or consecutive character in your password.
// Some older devices don't support passwords longer than 15 characters.

// for verification code valdiation

const codeValidation = [
  body("code")
    .isLength({ min: 6 })
    .matches(/(^[0-9]{6}$)/)
    .withMessage("Invalid verification code"),
];

const validator = async (req, res, next) => {
  const isError = validationResult(req);

  if (!isError.isEmpty()) {
    const inputError = {};
    const errorArr = isError.array();

    errorArr.map(
      (e) =>
        (inputError[e.param] = errorArr
          .map((p) => {
            if (p.param === e.param) {
              return { message: e.msg, name: e.param };
            }
          })
          .filter((f) => f))
    );
    console.log(inputError);
    return res.status(400).json({ success: false, inputError });
  } else {
    return next();
  }
};

module.exports = { validator, dataValidationRules, codeValidation };
