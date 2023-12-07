const app = require("../../index"),
  { chai } = require("../../loaders/tests_setup");

describe("To test security update API", () => {
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
        done();
      });
  });

  it("should return a status of 200 and update security options.", async () => {
    let res = await agent
      .put("/user/account/manage/security")
      .set("Authorization", `Bearer ${token}`)
      .send({ two_step_verification: false, login_notification: false });

    res.should.have.status(200);
    res.should.be.a("object");
  }).timeout(5000);
});
