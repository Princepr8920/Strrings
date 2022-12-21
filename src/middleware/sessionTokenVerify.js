require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifySession = (req, res, next) => {
  const {token} = req.params
  if (!token) return res.sendStatus(401);
 
  jwt.verify(token,process.env.JWT_SESSION_SECRET,(err,decoded)=>{
     if(err) return res.sendStatus(403);
     req.userId = decoded.email
     next()
  })
};

module.exports = verifySession