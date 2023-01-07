function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.isAuthenticated(), "user is authenticated");
    next();
  } else {
    console.log(req.isAuthenticated(), "user is NOT authenticated");
    res.sendStatus(401);
  }
}

module.exports = ensureAuth;
