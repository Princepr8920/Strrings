const { Update_Error } = require("../service/handleErrors");
const { findOneUser } = require("../database/database");

async function Lock(req, res, next) {
  try {
    const securityToken = req.cookies.editing_mode,
      isUnlocked = await findOneUser({ securityToken });
    if (isUnlocked) {
      return next();
    } else {
      throw new Update_Error("Unauthorized Access", 401);
    }
  } catch (error) {
    next(error);
  }
}

module.exports = Lock;
