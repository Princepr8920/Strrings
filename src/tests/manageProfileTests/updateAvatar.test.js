const app = require("../../index"),
  { chai } = require("../../loaders/tests_setup");

describe("Test user avatar api", () => {
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
        // The `agent` now has the sessionid cookie saved, and will send it
        // back to the server in the next request:
      });
  });

  it("should return status 200 and user avatar.", async () => {
    let res = await agent
      .get("/get/user/avatar")
      .set("Authorization", `Bearer ${token}`);

    res.should.have.status(200);
    res.body.should.have.property("avatar");
  }).timeout(3000);

  it("should return status 200 and update user Avatar", async () => {
    const filePath = `src/media/images/avatars/large/default_avatar.jpg`;

    let res = await agent
      .patch("/user/update-avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", filePath);

    res.should.have.status(200);
    res.body.should.have.property("user");
    res.body.message.should.equal("Avatar updated successfully.");
  }).timeout(5000);

  it("should return status 200 and set default user avatar", async () => {
    let res = await agent
      .get("/user/remove-avatar")
      .set("Authorization", `Bearer ${token}`);

    res.should.have.status(200);
    res.body.should.have.property("user");
    res.body.message.should.equal("Avatar removed successfully");
  }).timeout(3000);
});
