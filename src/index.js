const express = require("express"),
  app = express(),
  cors = require("cors"),
  dotenv = require("dotenv").config(),
  corsOptions = require("./config/corsOptions"),
  session = require("./loaders/express_session"),
  mongoose = require("./loaders/mongoose"),
  logger = require("morgan"),
  authRoutes = require("./routes/authRoutes"),
  userRoutes = require("./routes/userRoutes"),
  { passport_init, passport_session } = require("./loaders/passport"),
  handleErrors = require("./middleware/checkErrors"),
  Credentials = require("./middleware/credentials"),
  rateLimiter = require("./middleware/rateLimiter");
// mongodb = require("./loaders/mongodb")
app.use(Credentials);
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(require("cookie-parser")());
app.use(session);
app.use(passport_init);
app.use(passport_session);
mongoose();
app.use(
  "/resend",
  rateLimiter(1, 2, { success: false, message: "Resend otp in 1 minutes",status:429 }, 429)
);

authRoutes.use(handleErrors);
userRoutes.use(handleErrors);
app.use(authRoutes);
app.use(userRoutes);

app.listen(process.env.PORT, (err) => {
  if (err) console.error(err);
  console.log("Server started successfully : " + process.env.PORT + " 🎉");
  // mongodb.connectToDatebase()
});
