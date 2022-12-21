const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

let userSchema = Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "username required"],
    trim: true,
  },
  first_name: {
    type: String,
    required: [true, "firstName required"],
    trim: true,
  },
  last_name: { type: String, trim: true },
  password: {
    type: String,
    minLength: 8,
    required: [true, "password required"],
  },
  picture: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1531214159280-079b95d26139?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  },
  bio: { type: String, default: "bio not avilable" },
  status: { type: String, default: "none" },
  email: {
    type: String,
    required: [true, "Email required"],
    unique: [true, "Email already registered"],
    trim: true,
  },
  userID: { type: String },
  provider: { type: String, default: "local" },
  last_Visited: { type: Date, default: new Date(), required: true },
  joined_At: { type: Date, default: new Date(), required: true },
  date_of_birth: { type: Date, default: new Date() },
  securityToken:{type:String},
  refreshToken: { type: String },
  preferences: {
    dark_mode: { type: Boolean, default: false },
  },
  security: {
    two_step_verification: { type: Boolean, default: false },
    login_notification: { type: Boolean, default: false },
  },
  confirmationCode: [
    { otp: String, for: String, resend: Boolean, issueAt: Date },
  ],
  userRequests: [{ emailRequest: String, issueAt: Date }],
  account_status: { type: String, default: "Account verification pending" },
  requestsToken: { type: String },
  user_logs: {
    email_logs: [
      {
        email: { type: String, required: true },
        updated_on: { type: Date, default: new Date() },
        count: { type: Number, default: 0 },
      },
    ],
    username_logs: [
      {
        username: { type: String, required: true },
        updated_on: { type: Date, default: new Date() },
        count: { type: Number, default: 0 },
      },
    ],
    visit_logs: [
      {
        visited_on: { type: Date, default: new Date() },
        time_spent: { type: String },
        visited_count: { type: Number, required: true },
      },
    ],
  },
});

//////// login count in schema

userSchema.pre("save", function (done) {
  let salt = 10;
  let user = this;
  if (!user.isModified("password")) {
    return done();
  }
  bcrypt.genSalt(salt, (err, salted) => {
    if (err) {
      return done(err);
    } else {
      bcrypt.hash(user.password, salted, (err, hashedPassword) => {
        if (err) {
          return done(err);
        } else {
          user.password = hashedPassword;
          done();
        }
      });
    }
  });
});

userSchema.methods.checkPassword = function (guess, done) {
  bcrypt.compare(guess, this.password, (err, isMatch) => {
    if (err) {
      return err;
    } else {
      done(err, isMatch);
    }
  });
};

let localUser = mongoose.model("localUser", userSchema);
module.exports = localUser;
