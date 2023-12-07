const app = require("../../index"),
  { findOneUser } = require("../../database/database"),
  { chai } = require("../../loaders/tests_setup");

describe("Signup route test", () => {
  let user;

  beforeEach(function (done) {
    findOneUser({ username: "tester" }).then(function (res) {
      user = res;
      done();
    });
  });

  it("Test index", async function () {
    let res = await chai.request(app).get("/");
    res.should.have.status(200);
  }).timeout(5000);

  it("should return a status of 202 or 200 and a success message on successful signup 🚻✔.", async () => {
    if (!user) {
      let res = await chai.request(app).post("/signup").send({
        first_name: "Test_user",
        last_name: "",
        username: "tester",
        email: "princepr1828@gmail.com",
        password: "123456789!Qa",
        confirm_password: "123456789!Qa",
      });

      res.should.have.status(202);
      res.should.be.a("object");
      res.body.message.should.equal("Account verification pending.");
    } else if (user.account_status === "Account verification pending.") {
      let res = await chai
        .request(app)
        .post("/verify-user-account")
        .set("Cookie", [`welcome_cookies=${user.tokens.signupToken}`])
        .send({
          code: user.confirmationCode.code,
        });

      res.should.have.status(200);
      res.should.be.a("object");
    } else if (
      user.account_status === "Account verification pending." &&
      user?.confirmationCode?.count >= 0
    ) {
      /// if user is not verified then it resend new confirmation code
      let res = await chai
        .request(app)
        .get("/resend-account-verification-code")
        .set("Cookie", [`welcome_cookies=${user.tokens.signupToken}`]);

      res.should.have.status(200);
      res.should.be.a("object");
      res.body.should.have.property("time");
    }
  }).timeout(5000);
});

describe("Cancel signup verification test", () => {
  let newUser;

  beforeEach(function (done) {
    this.timeout(10000);
    chai
      .request(app)
      .post("/signup")
      .send({
        first_name: "Test_user",
        last_name: "",
        username: "tester2",
        email: "princepr2728@gmail.com",
        password: "123456789!Qa",
        confirm_password: "123456789!Qa",
      })
      .then(async function (res) {
        newUser = await findOneUser({ username: "tester2" });
        res.should.have.status(202);
        done();
      });
  });

  it("should return status of 204 and a success message when user cancel signup verification proccess.", async () => {
    if (newUser) {
      const res = await chai
        .request(app)
        .delete("/cancel-verification")
        .set("Cookie", [`welcome_cookies=${newUser.tokens.signupToken}`]);

      res.should.have.status(204);
      res.should.be.a("object");
    }
  }).timeout(5000);
});

describe("Signup errors errors test", () => {
  it("should return a status of 400 and a error message if email already taken 🚹.", async () => {
    let res = await chai.request(app).post("/signup").send({
      first_name: "Test_user",
      last_name: "",
      username: "tester1",
      email: "princepr1828@gmail.com",
      password: "123456789!Qa",
      confirm_password: "123456789!Qa",
    });

    res.should.have.status(400);
    res.should.be.a("object");
    res.body.inputError.email[0].message.should.equal(
      "This email address is not available. Choose a different address."
    );
  }).timeout(4000);

  it("should return a status of 400 and a error message if username already taken ⏹.", async () => {
    let res = await chai.request(app).post("/signup").send({
      first_name: "Test_user",
      last_name: "",
      username: "tester",
      email: "validEmail@gmail.com",
      password: "123456789!Qa",
      confirm_password: "123456789!Qa",
    });

    res.should.have.status(400);
    res.should.be.a("object");
    res.body.inputError.username[0].message.should.equal(
      "That username is taken. Try another."
    );
  }).timeout(4000);

  it("should return a status of 400 and a error message if first_name field is empty ❗.", async () => {
    let res = await chai.request(app).post("/signup").send({
      first_name: "",
      last_name: "",
      username: "tssdfds",
      email: "validEmail@gmail.com",
      password: "123456789!Qa",
      confirm_password: "123456789!Qa",
    });

    res.should.have.status(400);
    res.should.be.a("object");
    res.body.inputError.first_name[0].message.should.equal(
      "Enter a First Name"
    );
  });

  it("should return a status of 400 and a error message if username length lower than 3 3️⃣ ◀.", async () => {
    let res = await chai.request(app).post("/signup").send({
      first_name: "Test_user",
      last_name: "",
      username: "te",
      email: "validEmail@gmail.com",
      password: "123456789!Qa",
      confirm_password: "123456789!Qa",
    });

    res.should.have.status(400);
    res.should.be.a("object");
    res.body.inputError.username[0].message.should.equal(
      "Username should be minimum 3 and maximum 30 characters."
    );
  });

  it("should return a status of 400 and a error message if password doesn't include special charaters 🈹", async () => {
    let res = await chai.request(app).post("/signup").send({
      first_name: "Test_user",
      last_name: "",
      username: "tester2",
      email: "validEmail@gmail.com",
      password: "123456789",
      confirm_password: "123456789",
    });

    res.should.have.status(400);
    res.should.be.a("object");
    res.body.inputError.password[0].message.should.equal(
      "Your password must have at least 1 uppercase letter."
    );
    res.body.inputError.password[1].message.should.equal(
      "Your password must have at least 1 lowercase letter."
    );
    res.body.inputError.password[2].message.should.equal(
      "Your password should have at least one special character."
    );
  });

  it("should return a status of 400 and a error message if confirm_password doesn't match ⁉.", async () => {
    let res = await chai.request(app).post("/signup").send({
      first_name: "Test_user",
      last_name: "",
      username: "tester2",
      email: "validEmail@gmail.com",
      password: "1234567891",
      confirm_password: "123456789",
    });

    res.should.have.status(400);
    res.should.be.a("object");
    res.body.inputError.confirm_password[0].message.should.equal(
      "Confirm password does not match."
    );
  });
});
