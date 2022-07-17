let express = require("express")
let app = express()
let cors = require("cors");
let passport = require("passport"); 
let session = require("express-session"); 
let path = require("path") 
let mongoose = require("mongoose");
let flash = require("connect-flash"); 
const logger = require('morgan'); 
require("dotenv").config() 
app.use(logger('dev'));
let routes = require("./routes/routes")
let myPassport = require("./service/auth")
   
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(session({
  secret:process.env.TOP_SECRET,
  resave:true,
  saveUninitialized :true,
  cookie:{ maxAge : 1000 * 60 * 60 * 24 }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json({"limit":"1mb"}))
 myPassport()
app.use(cors());
app.use(flash())

 app.use(routes)

mongoose.connect(process.env.DB_CONN,(err)=>{
  if(err)console.log(err);
  console.log("DataBase connected successfully 🧠")
}); 
  
 
app.listen(process.env.PORT,(err)=>{
  if(err) console.log(err)
  console.log("app in listing on : "+process.env.PORT +' 🎉')
})


 


 