let localUser = require("../models/localModel");
module.exports = class CreateNewUser {
  async addNewUser(info) {
    let {
      user: { username, password, email, first_name, last_name },
    } = info;

    let values = new localUser({
      username,
      email,
      password,
      first_name,
      last_name,
      status: "none",
      date_of_birth: new Date(),
      user_logs: {
        email_logs: [
          {
            email,
          },
        ],
        username_logs: [
          {
            username,
          },
        ],
      },
    });

    let savedInfo = await values.save();
    return savedInfo;
  }
};
