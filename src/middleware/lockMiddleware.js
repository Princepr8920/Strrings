const localUser = require("../models/localModel");
const { Update_Error } = require("../service/handleErrors");

async function Lock(req, res, next) {
  try {
    const securityToken = req.cookies.editing_mode;
    const isUnlocked = await localUser.findOne({ securityToken });
    if (isUnlocked) {
      return next();
    } else {
      throw new Update_Error("Bad request", 400);
    }
  } catch (error) {
    res.status(400).json(error)
    next(error);
  }
}

module.exports = Lock;
