const express = require("express"),
  app = express(),
  path = require("path"),
  cors = require("cors"),
  dotenv = require("dotenv").config(),
  helmet = require("helmet"),
  hpp = require("hpp"),
  mongoSanitize = require("express-mongo-sanitize"),
  cookieParser = require("cookie-parser"),
  corsOptions = require("./config/corsOptions"),
  session = require("./loaders/express_session"),
  mongodb = require("./loaders/mongodb"),
  logger = require("morgan"),
  authRoutes = require("./routes/authRoutes"),
  profileUpdateRoutes = require("./routes/profileUpdateRoutes"),
  mainRoutes = require("./routes/mainRoutes"),
  chatRoutes = require("./routes/chatRoutes"),
  settingRoutes = require("./routes/settingsRoutes"),
  { passport_init, passport_session } = require("./loaders/passport"),
  handleErrors = require("./middleware/checkErrors"),
  Credentials = require("./middleware/credentials"),
  localAuth = require("./service/localAuth"),
  verifyJWT = require("./middleware/verifyJwt"),
  isAuthOk = require("./middleware/ensureAuth"),
  { preValidator } = require("./middleware/validator"),
  immutableFields = require("./middleware/immutableFields"),
  port = process.env.PORT || 5000,
  mySocket = require("./service/socketServices/socketIo"),
  http = require("http"),
  server = http.createServer(app),
  cloudMessaging = require("./loaders/fcm");

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.gstatic.com"],
      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],
      imgSrc: [
        "'self'",
        "https:",
        "data:",
        "https://d33ukiczlfmqs7.cloudfront.net",
      ],
      connectSrc: [
        "'self'",
        "https://firebaseinstallations.googleapis.com",
        "https://fcmregistrations.googleapis.com",
        "https://d33ukiczlfmqs7.cloudfront.net",
      ],
      objectSrc: ["'none'"],
    },
  })
);

app.set("trust proxy", 1);
app.use(hpp());
app.disable("x-powered-by");
app.use(mongoSanitize());
app.use(Credentials);
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(session);
app.use(passport_init);
app.use(passport_session);
localAuth();
mongodb.connectToDatabase("Strrings");
mySocket(server); // To start socket
cloudMessaging(); // To start Firebase cloud messaging service
app.use(express.static(path.join(__dirname, "../public")));

app.use(handleErrors);
authRoutes.use(handleErrors);
profileUpdateRoutes.use(handleErrors);
mainRoutes.use(handleErrors);
settingRoutes.use(handleErrors);
chatRoutes.use(handleErrors);
mainRoutes.use(handleErrors);

app.use(preValidator);
app.use(authRoutes);
app.use(immutableFields);
app.use(isAuthOk);
app.use(verifyJWT); /// set verify jwt for auth also
app.use(profileUpdateRoutes);
app.use(mainRoutes);
app.use(chatRoutes);
app.use(settingRoutes);

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
  return;
});

server.listen(port, (err) => {
  if (err) console.error(err);
  console.log("Server started successfully : " + port + " 🧠");
});

module.exports = app;
