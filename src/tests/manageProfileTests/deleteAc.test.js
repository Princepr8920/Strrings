const app = require("../../index"),
  { findOneUser } = require("../../database/database"),
  { chai } = require("../../loaders/tests_setup");

describe("Delete user Account test", () => {
  let agent = chai.request.agent(app),
    token,
    user,
    manuallySetCookie;

  before(function (done) {
    this.timeout(15000);
    user = findOneUser({ username: "tester2" }).then((data) => {
      if (data) {// if we have already a user so that we will login 
        agent
          .post("/login")
          .send({ email: "princepr2728@gmail.com", password: "123456789!Qa" })
          .then(async function (res) {
            manuallySetCookie = res.header["set-cookie"][0].split(" ")[0];
            agent.jar.setCookies(manuallySetCookie);
            token = res.body.accessToken;
            user = await findOneUser({ username: "tester2" });
            res.should.have.cookie("user_session");
            res.should.have.status(200);
            await agent
              .post("/user/account/security")
              .set("Authorization", `Bearer ${token}`)
              .send({ securityCode: "123456789!Qa", userID: user.userID })
              .then(async (data) => {
                user = await findOneUser({ username: "tester2" });
                data.should.have.status(200);
                done();
              });
          });
      } else {// else we will signup with new user
        agent
          .post("/signup")
          .send({
            first_name: "Test_user",
            last_name: "",
            username: "tester2",
            email: "princepr2728@gmail.com",
            password: "123456789!Qa",
            confirm_password: "123456789!Qa",
          })
          .then(async (verifyRes) => {
            verifyRes.should.have.status(202);
            manuallySetCookie = verifyRes.header["set-cookie"][0].split(" ")[0];
            agent.jar.setCookies(manuallySetCookie);
            user = await findOneUser({ username: "tester2" });
            await agent
              .post("/verify-user-account")
              .set("Cookie", [`welcome_cookies=${user.tokens.signupToken}`])
              .send({
                code: user.confirmationCode.code,
              })
              .then(async function (res) {
                token = res.body.accessToken;
                user = await findOneUser({ username: "tester2" });
                res.should.have.status(200);
                res.should.be.a("object");
                await agent
                  .post("/user/account/security")
                  .set("Authorization", `Bearer ${token}`)
                  .send({ securityCode: "123456789!Qa", userID: user.userID })
                  .then(async (data) => {
                    user = await findOneUser({ username: "tester2" });
                    data.should.have.status(200);
                    done();
                  });
              });
          });
      }
    });
  });

  it("should return status 200 and allow access to delete Account.", async () => {
    agent.jar.setCookies(`mng_mode=${user.tokens.securityToken}`); // we manually set cookie (mng_mode) to delete user account
    let res = await agent
      .delete(`/delete/account/${user.userID}`)
      .set("Authorization", `Bearer ${token}`); 
    res.should.have.status(200);
  }).timeout(5000);
});
