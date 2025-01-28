const session = require("express-session");
const MongoStore = require("connect-mongo");


module.exports = session({
  secret: process.env.TOP_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy:true,
  cookie: {
    maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months session
    secure: false,
    httpOnly: true,
    sameSite: "strict",
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_DB_URL,
  }),
});
