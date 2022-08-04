let localUser = require("../models/localModel");
let googleUser = require("../models/googleModel");
let passport = require("passport");
const localAuth = require("../service/localAuth");
const e = require("connect-flash");

const signup = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let username = req.body.username;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  
  localUser.findOne({ $or: [ { "email":email }, { "username":username }] }, (err, profile) => {
    if (err) {
      console.log(err + "upper");
      return err;
    } else if (profile) {
      console.log(profile)
      if (profile.email === email) {
        console.log("email resgesterd");
        res.json({ status: 409, message: "Email already registered" });
      }else if (profile.username === username) {
        console.log("Username already taken");
        res.json({ status: 409, message: "Username already taken" });
      }  else {
        res.json({ status: 409, message: "User already exist" });
      }
    } else {
      let values = new localUser({
        username: username,
        email: email,
        password: password,
        provider: "local",
        picture: "no picture found",
        bio: "no bio found",
        first_name: first_name,
        last_name: last_name,
      });
      values.save((err, user) => {
        console.log(err + "niche");
        if (err) {
          if (password.length < 8) {
            res.json({ message: "Password too short", status: 401 });
          } else {
            return err;
          }
        } else {
          passport.authenticate("local")(req, res, () => {
            console.log(user);
            console.log(req.isAuthenticated());
            res.json({ status: 200, user });
          });
        }
      });
    }
  });
};

const login = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return err;
    } else if (!user) {
      res.send(info);
    } else {
      req.login(user, function (error) {
        if (error) return next(error);
        console.log(user);
        console.log(req.isAuthenticated());
        return res.json({ status: 200, user });
      });
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

const allUsers = (req, res) => {
  googleUser
    .find()
    .sort({ createdAt: "descending" })
    .exec((err, users) => {
      if (err) {
        return next(err);
      }
      res.json(users);
    });
};

module.exports = {
  allUsers,
  signup,
  login,
  googleScope,
  logout,
};


    