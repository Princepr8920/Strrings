const emailSender = require("../../../service/confirmationCode");
const sendNewEmail = new emailSender();

const resendOtp = async (req, res) => {
  let path = req.path;
  let isEmailSent;
  if (path.includes("resend-2-step-verification-code")) {
    const loginToken = req.cookies.secure_login;
    isEmailSent = await sendNewEmail.resendVerificationEmail({
      type: "two_step_verification",
      pass: ["loginToken", loginToken],
    });
  } else {
    const signupToken = req.cookies.welcome_cookies;
    isEmailSent = await sendNewEmail.resendVerificationEmail({
      type: "verify_Account",
      pass: ["signupToken", signupToken],
    });
  }

  return res.status(isEmailSent.status).json(isEmailSent);
};

module.exports = resendOtp;
