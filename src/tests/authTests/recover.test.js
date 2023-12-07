const app = require("../../index"),
  { chai } = require("../../loaders/tests_setup"),
  { findOneUser } = require("../../database/database");

describe("Test passoword recovery Api", () => {
  let user;

  beforeEach(function (done) {
    findOneUser({ username: "tester" }).then(function (res) {
      user = res;
      done();
    });
  });

  it("should return a status of 200 and send a reset password link to user📤.", async () => {
    if (user?.tokens?.requestsToken === "") {
      let res = await chai.request(app).post("/user/password/recovery").send({
        email: "princepr1828@gmail.com",
      });
      res.should.be.a("object");
      res.should.have.status(200);
    } else {
      // it only redirects if localhost 3000 running
      let res = await chai
        .request(app)
        .get(`/account/verify/${user?.tokens?.requestsToken}`)
        .redirects(0); //To ensure that the redirect response is handled correctly, we disable the automatic following of redirects using.

      res.should.redirect;
      res.should.have.status(302);
      res.should.redirectTo(
        `http://localhost:3000/user/passwordrecovery/setnewpassword/${user?.tokens?.requestsToken}`
      );
    }
  }).timeout(10000);

  

  it("should return a status of 200 and when user successfully changes their passoword.", async () => {
    if (user?.tokens?.requestsToken !== "") {
      let res = await chai
        .request(app)
        .post(`/user/password/setnewpassword/${user?.tokens?.requestsToken}`)
        .set("Cookie", [`change_once=${user?.tokens?.requestsToken}`])
        .send({
          new_password: "123456789!Qa",
          confirm_password: "123456789!Qa",
        });

      res.should.have.status(200);
    }
  }).timeout(5000);
});
