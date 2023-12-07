const app = require("../../index"), 
  { chai } = require("../../loaders/tests_setup");

describe("To test password update API", () => {
  let agent = chai.request.agent(app),
    token,
    manuallySetCookie;

  beforeEach(function (done) {
    this.timeout(4000)
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

  it("should return a status of 200 and change user passoword.", async () => {
    let res = await agent
      .patch("/user/account/manage/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        current_password: "123456789!Aa",
        new_password: "123456789!Qa",
        confirm_password: "123456789!Qa",
      });

    res.should.have.status(200);
    res.should.be.a("object");
  }).timeout(5000);

  it("should return a status of 400 and a error message of wrong,short password.", async () => {
    let res = await agent
      .patch("/user/account/manage/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        current_password: "123456789!Aa",
        new_password: "1234567890",
        confirm_password: "123456789",
      });

    res.should.have.status(400);
    res.should.be.a("object");
    res.body.inputError.current_password[0].message.should.equal(
      "Wrong password"
    );
    res.body.inputError.confirm_password[0].message.should.equal(
      "Confirm password does not match"
    );
    res.body.inputError.new_password[1].message.should.equal(
      "Your password must have at least 1 uppercase letter."
    );
    res.body.inputError.new_password[2].message.should.equal(
      "Your password must have at least 1 lowercase letter."
    );
    res.body.inputError.new_password[0].message.should.equal(
      "Your new password should have at least one special character."
    );
  });
});
