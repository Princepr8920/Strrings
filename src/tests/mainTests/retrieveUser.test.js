const app = require("../../index"),
  { chai } = require("../../loaders/tests_setup");

describe("Main routes test", () => {
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
      }) 
  });

  it("should return status 200 and get all users", (done) => {
    agent
      .get("/getUsers")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it("should return status 200 and selected user", (done) => {
    agent
      .get("/get-friend-profile/tester")
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});



