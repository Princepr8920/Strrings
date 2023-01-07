const nodeMailer = require("nodemailer");

const sender = {
  user: "princem1620m@gmail.com",
  pass: process.env.APP_MAIL_PASS,
};

const transport = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: sender.user,
    pass: sender.pass,
  },
});

const sendConfirmationEmail = async (username, email, type, secret) => {
  let body = {
    verify_Account: {
      subject: "Verify your HelloApp ID email address ✔",
      html: `<h1>Verify your HelloApp ID email address</h1>
 <h2>Hello ${username} </h2>
 <p>You have selected this email address as your HelloApp ID. 
 To verify this email address belongs to your 
 enter the code below on the email veirfication page</p>
  <h3>${secret}</h3>
  <p>This code will expire in two hours after this email was sent</p>
  <strong>HelloApp Team</strong>`,
    },
    reset: {
      subject: "Reset password instructions 🤦‍♂️",
      html: ` 
   <h2>Hello ${username} </h2>
   <p>You requested a link to reset your password for HelloApp account.
   Use the link below to login and set a new password.</p>
    <a href=${secret}>Reset my HelloApp account password</a>
    <p>This link will expire in 30 minutes after this email was sent.</p>
    <p>If you didn't request this, please ignore this email.</p>
   <p>Your password won't change until you access the link above and create a new one.</p>
   <strong>HelloApp Team</strong>
    `,
    },
    verify_Email: {
      subject: "Verify your new email address ✔",
      html: `<h1>Verify your new email address</h1>
 <h2>Hello</h2>
   <p>You recently selected ${email} as your new HelloApp ID. 
   To verify this email address belongs to you,
    enter the code below on the email verification page
 </p>
  <h3>${secret}</h3>
  <p>This code will expire in one hour after this email was sent</p>
  <strong>HelloApp Team</strong>`,
    },
  };

  try {
    await transport.sendMail({
      from: sender.user,
      to: email,
      subject: body[type].subject,
      html: body[type].html,
    });
    return { success: true, message: "Email sent successfully!" }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Email not sent !" };
  }
};

module.exports = { sendConfirmationEmail };
