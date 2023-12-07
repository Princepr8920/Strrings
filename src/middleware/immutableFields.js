async function immutableFields(req, res, next) {
  let path = req.path;
  let data = req.body;


// This middleware prevent to change below fields by user

  let fields = [
    "userID",
    "tokens",
    "_id",
    "user_logs",
    "feedback",
    "userRequests",
    "verification",
    "confirmationCode",
    "joined_at",
    "last_seen",
    "provider",
    "__v",
    "events"    
  ];

  for (let i of fields) {
    if (data.hasOwnProperty(i)) {
      delete data[i];
    }
  }

  if (
    data.hasOwnProperty("email") &&
    path !== "/user/account/manage/unique/email&username"
    // Prevent to change email without verificaiton
  ) {
    delete data.email;
  }

  next();
}

module.exports = immutableFields;
