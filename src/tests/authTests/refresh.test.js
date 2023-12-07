const app = require("../../index"),
  jwt = require("jsonwebtoken"),
  { chai } = require("../../loaders/tests_setup"),
  { findOneUser } = require("../../database/database");

// To test this route we need to disable login test because login route fire evertime and new refresh token create that causes errors with this tests
// also disable logout tests

describe("Test refresh route", () => {
  let user;
  let decoded_jwt;

  beforeEach(function (done) {
    findOneUser({ username: "tester" }).then(function (res) {
      user = res;
      decoded_jwt = jwt.verify(
        user.tokens.refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      done();
    });
  });

  it("should return a status of 200 and a object of user information with accessToken.", async () => {
    if (user?.userID === decoded_jwt?.userID) {
      let res = await chai
        .request(app)
        .get("/refresh")
        .set("Cookie", [`user_session=${user.tokens.refreshToken}`]);

      res.should.have.status(200);
      res.should.be.a("object");
      res.body.should.have.property("userWithToken");
      res.body.should.have.property("accessToken");
    } else if (!user.tokens.refreshToken || !user) {
      // we user have not session cookies or don't find user who belong to that cookies
      let res = await chai.request(app).get("/refresh");
      res.should.have.status(401);
    } else {
      // if user session expired
      let res = await chai
        .request(app)
        .get("/refresh")
        .set("Cookie", [`user_session=${user.tokens.refreshToken}`]);

      res.should.have.status(403);
    }
  });
});
