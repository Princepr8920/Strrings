const express = require("express"),
  app = express(),
  path = require("path"),
  cors = require("cors"),
  dotenv = require("dotenv").config(),
  helmet = require("helmet"),
  hpp = require("hpp");
(mongoSanitize = require("express-mongo-sanitize")),
  (cookieParser = require("cookie-parser")),
  (corsOptions = require("./config/corsOptions")),
  (session = require("./loaders/express_session")),
  (mongodb = require("./loaders/mongodb")),
  (logger = require("morgan")),
  (authRoutes = require("./routes/authRoutes")),
  (profileUpdateRoutes = require("./routes/profileUpdateRoutes")),
  (mainRoutes = require("./routes/mainRoutes")),
  (chatRoutes = require("./routes/chatRoutes"));
(settingRoutes = require("./routes/settingsRoutes")),
  ({ passport_init, passport_session } = require("./loaders/passport")),
  (handleErrors = require("./middleware/checkErrors")),
  (Credentials = require("./middleware/credentials")),
  (localAuth = require("./service/localAuth")),
  (verifyJWT = require("./middleware/verifyJwt")),
  (isAuthOk = require("./middleware/ensureAuth")),
  (bodyParser = require("body-parser")),
  ({ preValidator } = require("./middleware/validator")),
  (immutableFields = require("./middleware/immutableFields")),
  (port = process.env.PORT || 5000),
  (mySocket = require("./service/socketServices/socketIo")),
  (http = require("http")),
  (server = http.createServer(app)),
  (cloudMessaging = require("./loaders/fcm"));

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
    },
  })
);
app.set("trust proxy", 1);
app.use(hpp());
app.disable("x-powered-by");
app.use(mongoSanitize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(Credentials);
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(session);
app.use(passport_init);
app.use(passport_session);
localAuth();
mongodb.connectToDatebase("Strrings");
mySocket(server); // To start socket
cloudMessaging(); // To start Firebase cloud messaging service

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
  return res.sendFile(path.join(__dirname, "../public", "index.html"));
});

server.listen(port, (err) => {
  if (err) console.error(err);
  console.log("Server started successfully : " + port + " 🧠");
});

module.exports = app;
