let localUser = require("../models/localModel");
let googleUser = require('../models/googleModel')
let passport = require("passport"); 
let unsplash = require('./unsplash')

const signup = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let username = req.body.username;
  let first_name = req.body.first_name;
  let last_name =  req.body.last_name;
 

  
 

  localUser.findOne({ email: email, username:username }, (err, user) => {
    if (err) {
      return next(err);
    } else if (user) {
      res.json();
    } else {
      let values = new localUser({
        username: username,
        email: email,
        password: password,
        provider: "local",
        picture : "no picture found", 
        bio:"no bio found",
        first_name : first_name,
        last_name :  last_name,
      });
      values.save((err, user) => {
        if (err) return err;
        passport.authenticate("local")(req, res, () => {
          console.log("Following User has been registerd");
          console.log(user);
          console.log(req.isAuthenticated());
          console.log(user)
          res.json(user);
        });
      });
    }
  });
};

const login = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (!user) {
      console.log(info)
      res.send(info);
    } else {
      req.login(user, function (error) {
        if (error) return next(error);
        console.log(user);
        console.log(req.isAuthenticated());
        return res.json(user);
      });
      //response.send('Login successful');
    }
  })(req, res, next);
};

const googleScope = passport.authenticate("google", {
  scope: ["profile", "email"],
});

  
const logout = function (req, res) {
  req.logout((err) => {
    if (err) return err;
  });
  if (req.isAuthenticated()) {
    console.log(req.isAuthenticated());
    res.send("you are successfully Authenticated");
  } else {
    res.send("you are not Authenticated");
  }
};
 
const allUsers = (req,res) =>{
 
  googleUser.find()
  .sort({ createdAt: "descending" })
  .exec((err, users) => {
    if (err) {
      return next(err);
    }
  res.json(users)
  });
}
 


module.exports = {
  allUsers,
  signup,
  login,  
  googleScope,
  logout
};
