let passport = require("passport")
let LocalStrategy = require('passport-local').Strategy
let localUser =  require('../models/localModel') 
 
module.exports=()=>{
  passport.serializeUser((user,done)=>{
    console.log(user.id)
   return done(null,user.id)
  });
  passport.deserializeUser(async (id,done)=>{
    let currentUser = await localUser.findOne({id})
    done(null,currentUser)
  })
}

passport.use(new LocalStrategy({
  usernameField: 'email',     
  passwordField: 'password'
},
  function(email, password, done) {
    localUser.findOne({ email: email }, function (err, user){
      if (err) {return done(err); 

      }else if(!user){ 
      return done(null, false,{message:'User not exist',status:404 })
    }else{
      user.checkPassword(password,(err,isMatch)=>{
        if(err){
           return err
          }else if(isMatch){
          return done(null,user)
        }else{
         return done(null,false,{message:'Invaild password',status:401})
        }
      })
    }
    });
  }
));