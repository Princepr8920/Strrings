const session = require("express-session");
const MongoStore = require("connect-mongo");


module.exports = session({
  secret: process.env.TOP_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_DB_URL,
  }),
});
