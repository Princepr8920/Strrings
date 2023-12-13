const jwt = require("jsonwebtoken");

// To verify jwt token on every request
const verifyJWT = (req, res, next) => {
  if (req.path.startsWith("/api")) {
    // Path is related to API routes
    const authHeaders = req.headers.authorization || req.headers.Authorization;
    if (!authHeaders?.startsWith("Bearer ")) return res.sendStatus(401);

    const token = authHeaders.split(" ")[1];
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      req.userId = decoded.userID;
      next();
    });
  } else {
    // Path is related to client-side routing (wildcard route)
    next();
  }
};

module.exports = verifyJWT;
