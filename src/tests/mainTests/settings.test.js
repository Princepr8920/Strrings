const app = require("../../index"),
  { findOneUser } = require("../../database/database"),
  { chai } = require("../../loaders/tests_setup");

describe("Setting routes test", () => {
  let agent = chai.request.agent(app),
    token,
    manuallySetCookie;

  beforeEach(function (done) {
    agent
      .post("/login")
      .send({ email: "princepr1828@gmail.com", password: "123456789!Qa" })
      .then(async function (res) {
        manuallySetCookie = res.header["set-cookie"][0].split(" ")[0];
        agent.jar.setCookies(manuallySetCookie);
        token = res.body.accessToken;
        res.should.have.cookie("user_session");
        res.should.have.status(200);
        done();
      });
  });

  it("should return status 200 and update user prefrences.", async () => {
    let res = await agent
      .put("/account/settings/appearance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dark_mode: "system_default",
      });
    res.should.have.status(200);
  }).timeout(2000);

  it("should return status 200 and send user feedback.", async () => {
    let res = await agent
      .post("/user/feedback")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "test message 001" });
    res.should.have.status(200);
  }).timeout(5000);
});


describe("Logout API Tests", () => {
  let agent = chai.request.agent(app),
    token,
    manuallySetCookie;

  beforeEach(function (done) {
    agent
      .post("/login")
      .send({ email: "princepr1828@gmail.com", password: "123456789!Qa" })
      .then(async function (res) {
        manuallySetCookie = res.header["set-cookie"][0].split(" ")[0];
        agent.jar.setCookies(manuallySetCookie);
        token = res.body.accessToken;
        user = await findOneUser({ username: "tester" });
        res.should.have.cookie("user_session");
        res.should.have.status(200);
        done();
      });
  });

  it("should return a status of 204 on logout.", (done) => {
    agent
      .get("/logout")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  describe("Logout API Test without cookies", () => {
    let agent = chai.request.agent(app),
      token;

    beforeEach(function (done) {
      agent
        .post("/login")
        .send({ email: "princepr1828@gmail.com", password: "123456789!Qa" })
        .then(async function (res) {
          token = res.body.accessToken;
          res.should.have.cookie("user_session");
          res.should.have.status(200);
          done();
        });
    });

    it("should return a status of 403 when user have not user_session cookie.", (done) => {
      agent
        .get("/logout")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });
});
