const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 

let userSchema = mongoose.Schema({
  username: {type:String,unique:true,required: [true, "username required"] },
  first_name : {type:String,required: [true, "firstName required"] },
  last_name : String,
  password: { type: String, required: [true, "password required"] },
  picture: String,
  bio:String,
  email: {
    type: String,
    required: [true, "Email required"],
    unique: [true, "Email already registered"],
  },
  provider: { type: String, required: true },
  last_Visited: { type: Date, default: new Date() },
  joined_At: { type: Date, default: new Date() },
});


userSchema.pre("save", function(done){
  let salt = 10;
  let user = this;
  if (!user.isModified("password")) {
    return done();
  }
  bcrypt.genSalt(salt, (err, salted) => {
    if (err) {
      return done(err);
    } else {
      bcrypt.hash(user.password, salted, (err, hashedPassword) => {
        if (err) {
          return done(err);
        } else {
          user.password = hashedPassword;
          done();
        }
      });
    }
  });
});

userSchema.methods.checkPassword = (guess,done)=>{
  bcrypt.compare(guess,this.password,(err,isMatch)=>{
    if(err){
      return err
    }else{
      done(err,isMatch)
    }
  })
}

 

let localUser = mongoose.model("localUser", userSchema);
module.exports = localUser;
