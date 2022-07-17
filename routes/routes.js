let express = require("express");
let routes = express.Router();
let passport = require("passport");
let bodyParser = require("body-parser");
 
routes.use(express.json({ limit: "1mb" }));
routes.use(require("cookie-parser")());
routes.use(bodyParser.urlencoded({ extended: false }));

routes.use((req, res, next) => { 
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

routes.get("/",(req,res)=>res.send('welcome'))

routes.get('/auth/google',
  passport.authenticate('google', { scope: ['profile',"email"] }));

routes.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),
 (req,res,next)=>{  
    res.redirect('/success');
    next()
 });
 
routes.get("/failed",(req,res)=>{
  res.send("not Authenticated")
})
routes.get("/success",(req,res)=>{
  if(req.isAuthenticated()){
  res.send("you are successfully Authenticated")
}else{
  res.send("you are not Authenticated")
}
})

routes.get('/logout', function(req, res) {
  req.logout((err)=>{
if(err) return err
  })

    if(req.isAuthenticated()){
        console.log(req.isAuthenticated())
      res.send("you are successfully Authenticated")
    }else{
      res.send("you are not Authenticated")
    }
 
  
});



module.exports = routes;
