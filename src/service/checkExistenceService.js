let localUser = require("../models/localModel");
const { Identification_Error } = require("./handleErrors");

module.exports = class CheckExistence {
  #userInfo;
  constructor(userInfo) {
    this.#userInfo = userInfo;
  }

  async userExistance() {
    const { email, username, password } = this.#userInfo;
    let userProfile = await localUser
      .findOne({
        $or: [{ email }, { username }],
      })
      .lean();

    try {
      if (userProfile) {
        let collections = [userProfile];
        collections.forEach((doc) => {
          if (doc !== null) {
            if (doc?.email === email) {
              throw new Identification_Error("Email already registered", 409);
            } else if (doc?.username === username) {
              throw new Identification_Error(
                "That username is taken. Try another",
                409
              );
            } else {
              throw new Identification_Error("something went wrong", 500);
            }
          }
        });
      } else if (password?.length < 8) {
        throw new Identification_Error(
          "Use 8 or more characters with a mix of letters, numbers, and symbols.",
          401
        );
      } else {
        return { success: true, status: 200, user: this.#userInfo };
      }
    } catch (error) {
      console.error(error);
      return { success: false, ...error };
    }
  }
};
