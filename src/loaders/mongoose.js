let mongoose = require("mongoose"); 
require("dotenv").config();
module.exports = () =>{mongoose.connect( process.env.DB_LOC_CONN,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) return console.error(err);
  console.log("Database connected successfully 🧠");
});}