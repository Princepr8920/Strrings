const createToken = require("../../../service/createToken"),
  Secure = require("../../../utils/filterInfo"),
  SecureInfo = new Secure(),
  loginNotification = require("../../../service/userAgent");

const login = async (req, res, next) => {
  let userInfo = req.user;

  let tokens = await createToken({
    user: userInfo,
    saveToken: ["refreshToken", "socketToken"],
    tokenName: ["refreshToken", "accessToken", "socketToken"],
    deleteToken: { requestToken: "", loginToken: "" },
  });

  if (tokens.success) {
    const { refreshToken, accessToken, socketToken } = tokens.createdTokens;
    try {
      if (userInfo.security.login_notification) {
        await loginNotification({
          agentInfo: req.headers["user-agent"],
          username: userInfo.username,
          email: userInfo.email,
        });
      }
    } catch (error) {
      return next(error);
    }

    res.cookie("strrings_connect", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // for seven days
    });

    let excludeInfo = [
      "password",
      "_id",
      "confirmationCode",
      "userRequests",
      "verification",
      "tokens",
      "user_logs",
      "feedback",
      "provider",
      "__v",
    ];

    let filteredUserInfo = SecureInfo.filterInfo(userInfo, excludeInfo);
    return res.status(200).json({
      user: filteredUserInfo,
      accessToken,
      socketToken,
      success: true,
      message: "Login successful",
    });
  } else {
    return next(tokens);
  }
};

module.exports = login;
