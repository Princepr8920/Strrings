const { Verificaiton_Error } = require("../../../service/handleErrors"),
  passwordService = require("../../../service/passwordService"),
  SECURE_PASSWORD = new passwordService(),
  createToken = require("../../../service/createToken");

  // When user want to delete their account. He/she have to confirm their access with the security lock

const securityLock = async (req, res, next) => {
  const { securityCode } = req.body;
  const token = req.cookies.strrings_connect;

  try {
    const isPasswordOK = await SECURE_PASSWORD.checkPassword(
      securityCode,
      token
    );

    if (isPasswordOK) {
      const tokens = await createToken({
        user: req.user,
        saveToken: ["securityToken"],
        tokenName: ["securityToken"],
        deleteToken: null,
      });

      if (tokens.success) {
        const { securityToken } = tokens.createdTokens;

        res.cookie("mng_mode", securityToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          maxAge: 3 * 60 * 60 * 1000,
        });
        return res.sendStatus(200);
      } else {
        return next(tokens);
      }
    } else {
      throw new Verificaiton_Error("Wrong Password", 401);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = securityLock;
