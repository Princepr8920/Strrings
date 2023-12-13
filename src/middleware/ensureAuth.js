function ensureAuth(req, res, next) {
  if (req.path.startsWith("/api")) {// Path is related to API routes
    if (req.isAuthenticated()) {
      console.log(req.isAuthenticated(), "User is authenticated 🆗");
      next();
    } else {
      console.log(req.isAuthenticated(), "User is not authenticated 🛑");
      res.sendStatus(401);
    }
  }else{ // Path is related to client-side routing (wildcard route)
    next()
  }
}

module.exports = ensureAuth;
