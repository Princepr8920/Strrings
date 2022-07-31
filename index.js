let express = require("express")
let app = express()
let cors = require("cors");
let session = require("express-session");
const MongoStore = require('connect-mongo');
let passport = require("passport"); 
let path = require("path") 
let mongoose = require("mongoose");
let flash = require("connect-flash"); 
const logger = require('morgan'); 
require("dotenv").config() 
app.use(logger('dev'));
let routes = require("./routes/routes")
let googleAuth = require("./service/googleAuth")
let localAuth = require("./service/localAuth")
let bodyParser = require("body-parser");
let secret = require("./config/secrets")
 
routes.use(express.json({ limit: "1mb" }));
routes.use(require("cookie-parser")());
routes.use(bodyParser.urlencoded({ extended: false }));  


app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(session({
  secret:secret.secret,
  resave:true,
  saveUninitialized :true,
  cookie:{ maxAge : 1000 * 60 * 60 * 24, secure: false },
  store: MongoStore.create({
    mongoUrl: secret.db_conn
})
   
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json({"limit":"1mb"}))
 googleAuth()
 localAuth()
app.use(cors({
  origin:"http://localhost:3000",
  methods:"GET,POST,PUT,DELETE",
  credentials:true
}));
app.use(flash())

 app.use(routes)

mongoose.connect(secret.db_conn,(err)=>{
  if(err)console.log(err);
  console.log("DataBase connected successfully 🧠")
}); 
  
 
 
app.listen(secret.port,(err)=>{
  if(err) console.log(err)
  console.log("app in listing on : "+process.env.PORT +' 🎉')
})


 


 