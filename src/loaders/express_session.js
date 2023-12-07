const session = require("express-session");
const MongoStore = require("connect-mongo");
module.exports = session({
  secret: process.env.TOP_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24, secure: false, sameSite: "strict" },
  store: MongoStore.create({
    mongoUrl: process.env.DB_CONN,
  }),
});
