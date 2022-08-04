let getUserByEmail =
  (User) =>
  async ({ email }) => {
    return await User.findOne({ email });
  };

let newGoogleUser =
  (User) =>
  ({
    id,
    email,
    username,
    first_name,
    last_name,
    picture,
    provider,
    joined_At,
  }) => {
    const newUser = new User({
      id,
      username,
      first_name,
      last_name,
      picture,
      email,
      provider,
      joined_At,
    });
    return newUser.save();
  };

module.exports = (User) => {
  return {
    newGoogleUser: newGoogleUser(User),
    getUserByEmail: getUserByEmail(User),
  };
};
