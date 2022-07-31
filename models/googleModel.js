const mongoose  = require("mongoose");

let userSchema = mongoose.Schema({
  id:{
    type:String,
    default:null
  },
  username: String,
  picture:String,
  email:{
    type:String,
    required:[true,"Email required"],
    unique:[true,"Email already registered"]
  }, 
  provider:{ type:String,required:true },
  last_Visited : { type: Date, default: new Date()},
  joined_At : { type: Date, default: new Date()},
})

 let googleUser = mongoose.model("googleUser",userSchema) 
module.exports = googleUser;  

 