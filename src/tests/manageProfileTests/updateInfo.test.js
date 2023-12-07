const app = require("../../index"),
  { findOneUser } = require("../../database/database"),
  { chai } = require("../../loaders/tests_setup");

describe("Test manage information route", () => {
  let agent = chai.request.agent(app),
    token,
    manuallySetCookie;

  beforeEach(function (done) {
    agent
      .post("/login")
      .send({ email: "princepr1828@gmail.com", password: "123456789!Qa" })
      .then(async function (res) {
        manuallySetCookie = res.header["set-cookie"][0].split(" ")[0];
        agent.jar.setCookies(manuallySetCookie); // we manually set cookie to agent
        token = res.body.accessToken;
        res.should.have.cookie("user_session");
        done();
        // The `agent` now has the sessionid cookie saved, and will send it
        // back to the server in the next request:
      });
  });

  it("should return status 200 and update user info.", async () => {
    let res = await agent
      .patch("/user/account/manage/information")
      .set("Authorization", `Bearer ${token}`)
      .send({
        first_name: "iamtester",
        last_name: "Machine",
        bio: "I am a tester and i do my work bester then bester",
        date_of_birth: new Date(),
      });

    res.should.have.status(200);
    res.body.should.have.property("user");
    res.body.message.should.equal("Information updated successfully");
  }).timeout(5000);

  it("should return status 200 and update username only.", async () => {
    let res = await agent
      .patch("/user/account/manage/unique/email&username")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "tester",
      });

    res.should.have.status(200);
  }).timeout(5000);
  // uncomment this if we want to update username
});




describe("To test email & username update APi", () => {
  let agent = chai.request.agent(app),
    token,
    user,
    manuallySetCookie;

  beforeEach(function (done) {
    this.timeout(5000);
    agent
      .post("/login")
      .send({ email: "princepr1828@gmail.com", password: "123456789!Qa" })
      .then(async function (res) {
        manuallySetCookie = res.header["set-cookie"][0].split(" ")[0];
        agent.jar.setCookies(manuallySetCookie);
        token = res.body.accessToken;
        user = await findOneUser({ username: "tester2" });
        res.should.have.cookie("user_session");

        done();
      });
  });

  it("should return status 200 and update only email.", async () => {
    if (user) {
      let res = await agent
        .patch("/user/account/manage/unique/email&username")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "princepr1828@gmail.com",
          // username: "newTester", // if we want to test email and username update at same time so we can uncomment this property
        });

      res.should.have.status(202);
    }
  }).timeout(5000);

  it("should return status 200 and resend confirmation code.", async () => {
    if (user) {
      //It used to resend verificaiton code!
      let res = await agent
        .get("/user/email/verificaiton/resend")
        .set("Authorization", `Bearer ${token}`);

      res.should.have.status(200);
    }
  }).timeout(5000);

  after(async function () {
    if (user) {
      //It used to verify new email address!
      agent
        .post("/user/email/verification/done")
        .set("Authorization", `Bearer ${token}`)
        .send({ code: user.confirmationCode.code, userID: user.userID })
        .then(async function (res) {
          res.should.have.status(200);
          res.body.should.have.property("user");
          res.body.message.should.equal("Information updated successfully");
          done();
        });
    }
  });
});
