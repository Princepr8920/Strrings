const app = require("../../index"),
  { chai } = require("../../loaders/tests_setup"),
  { findOneUser } = require("../../database/database");

describe("Login API Tests", () => {
  let user;

  beforeEach(function (done) {
    findOneUser({ username: "tester" }).then(function (res) {
      user = res;
      done();
    });
  });

  it("should return a status of 202 or 200 when user login✔✔.", async () => {
    if (user.security.two_step_verification && !user.confirmationCode.for) {
      let res = await chai
        .request(app)
        .post("/login")
        .send({ email: "princepr1828@gmail.com", password: "123456789!Qa" });

      res.should.have.status(202);
      res.should.be.a("object");
      res.body.message.should.equal("Code sent.");
    } else if (!user.security.two_step_verification) {
      let res = await chai
        .request(app)
        .post("/login")
        .send({ email: "princepr1828@gmail.com", password: "123456789!Qa" });

      res.should.have.status(200);
      res.should.be.a("object");
      res.body.message.should.equal("Login successful");
    } else if (user.confirmationCode.for === "two_step_verification") {
      let res = await chai
        .request(app)
        .post("/two-step-verification")
        .set("Cookie", [`secure_login=${user.tokens.loginToken}`])
        .send({ code: user.confirmationCode.code });

      res.should.have.status(200);
      res.should.be.a("object");
      res.body.message.should.equal("Login successful");
    } else if (
      user?.confirmationCode?.count >= 0 &&
      user.confirmationCode.for === "two_step_verification"
    ) {
      /// if user is not verified then it resend new confirmation code
      let res = await chai
        .request(app)
        .get("/resend-2-step-verification-code")
        .set("Cookie", [`secure_login=${user.tokens.loginToken}`]);

      res.should.have.status(200);
      res.should.be.a("object");
      res.body.should.have.property("time");
    }
  }).timeout(10000);
});

describe("Login errors API Tests", () => {
  it("should return a status of 404 and an error message on invalid Email ❌.", (done) => {
    chai
      .request(app)
      .post("/login")
      .send({ email: "invalidUser", password: "passwordOK" })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.message.should.equal("User not exist");
        res.should.be.a("object");
        done();
      });
  });

  it("should return a status of 401 and an error message on invalid Password ❌.", (done) => {
    chai
      .request(app)
      .post("/login")
      .send({ email: "princepr1828@gmail.com", password: "invalidpassword" })
      .end((err, res) => {
        res.should.have.status(401);
        res.should.be.a("object");
        res.body.message.should.equal("Wrong Password");
        done();
      });
  });
});
