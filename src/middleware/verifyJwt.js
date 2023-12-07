const jwt = require("jsonwebtoken");

// To verify jwt token on every request
const verifyJWT = (req, res, next) => {
  
  const authHeaders = req.headers.authorization || req.headers.Authorization;
  if (!authHeaders?.startsWith("Bearer ")) return res.sendStatus(401);
 
  const token = authHeaders.split(" ")[1];
  jwt.verify(token,process.env.JWT_ACCESS_SECRET,(err,decoded)=>{
     if(err) return res.sendStatus(403);
     req.userId = decoded.userID
     next()
  })
};

module.exports = verifyJWT 