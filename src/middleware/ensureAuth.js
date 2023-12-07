function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.isAuthenticated(), "User is authenticated 🆗");
    next();
  } else {
    console.log(req.isAuthenticated(), "User is not authenticated 🛑");
    res.sendStatus(401);
  }
}

module.exports = ensureAuth;
