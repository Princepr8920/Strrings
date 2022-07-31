let express = require("express");
let routes = express.Router();
let passport = require("passport");
let unsplash = require('../controllers/unsplash')

let {
  signup,
  login, 
  googleScope,
  logout,
  allUsers
} = require("../controllers/auth-control");

routes.get("/", (req, res) => res.sendStatus(200));

routes.get("/auth/google", googleScope);

routes.get( "/auth/google/callback",
  passport.authenticate("google", {successRedirect:"http://localhost:3000/checkauth", failureRedirect: "/failed" })
);

routes.get("/users",allUsers)

routes.get("/failed", (req, res) => {
  res.send("not Authenticated");
});

routes.get('/login/success',(req,res)=>{
  console.log(req.user)
  res.send(req.user)
})

routes.get("/logout", logout);
 
routes.post("/login", login);

routes.post("/signup", signup);

routes.get("/pics", function(req, res){
  let pics = unsplash();
  let info = {"status":200,"photos":pics}
      res.json(info)
    });


module.exports = routes;
