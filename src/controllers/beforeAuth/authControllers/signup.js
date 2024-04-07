const createToken = require("../../../service/createToken");

const signup = async (req, res, next) => {
  let newUser = req.user;
  let tokens = await createToken({
    user: newUser,
    saveToken: ["signupToken"],
    tokenName: ["signupToken"],
    deleteToken: null,
  });

  if (tokens.success) {
    const { signupToken } = tokens.createdTokens;

    res.cookie("welcome_cookies", signupToken, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(202).json({
      message: "Account verification pending.",
      email: newUser.email,
      success: true,
      newUser: true,
    });
  } else {
    return next(tokens); // It will become an error
  }
};

module.exports = signup;
