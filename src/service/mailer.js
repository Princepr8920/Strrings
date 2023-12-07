const nodeMailer = require("nodemailer");
const currentDate = require("../utils/date");

const sender = {
  user: process.env.APP_MAIL,
  pass: process.env.APP_MAIL_PASS,
};

const transport = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: sender.user,
    pass: sender.pass,
  },
});

const sendConfirmationEmail = async (info) => {
  const { username, email, type, secret, message } = info;
  const indianTime = currentDate("+5.5").split(",");

  let body = {
    verify_Account: {
      subject: "Verify your Strrings ID email address ✔",
      html: `<h1>Verify your Strrings ID email address</h1>
 <h2>Hello ${username} </h2>
 <p>You have selected this email address as your Strrings ID. 
 To verify this email address belongs to your 
 enter the code below on the email veirfication page</p>
  <h3>${secret}</h3>
  <p>This code will expire in two hours after this email was sent</p>
  <strong>Strrings Developer</strong>`,
    },
    reset: {
      subject: "Reset password instructions.",
      html: ` 
   <h2>Hello ${username} </h2>
   <p>You requested a link to reset your password for Strrings account.
   Use the link below to login and set a new password.</p>
    <a href=${secret}>Reset my Strrings account password</a>
    <p>This link will expire in 30 minutes after this email was sent.</p>
    <p>If you didn't request this, please ignore this email.</p>
   <p>Your password won't change until you access the link above and create a new one.</p>
   <strong>Strrings Developer</strong>
    `,
    },
    verify_Email: {
      subject: "Verify your new email address.",
      html: `<h1>Verify your new email address</h1>
 <h2>Hello</h2>
   <p>You recently selected ${email} as your new Strrings ID. 
   To verify this email address belongs to you,
    enter the code below on the email verification page
 </p>
  <h3>${secret}</h3>
  <p>This code will expire in one hour after this email was sent</p>
  <strong>Strrings Developer</strong>`,
    },
    feedback: {
      subject: `New feedback from ${username}`,
      html: `<div style="padding:5px; border:1px solid green;">
      <span>Message:</span>
      <h3>${message}</h3>
      </div>
      <div>
      <h3>About this user</h3> 
      <ul>
     <li>Username : ${username}</li>
     <li>Email : ${email}</li> 
     <li>Time : ${indianTime[1]}</li>
     <li>Date : ${indianTime[0]}</li>
     </ul>
     </div>`,
    },
    two_step_verification: {
      subject: `Your Login Security Code`,
      html: `Dear ${username},
  
  <p>We have received a login request for your account. To ensure the security of your account, please use the following security code to complete the login process:</p>
  
  <strong>Security Code: ${secret}</strong>
  
  <p>If you did not initiate this login request or are unsure why you received this email, please disregard it and take the necessary steps to secure your account.
  
  Please note that the security code is time-sensitive and will expire after a 30 minutes. If the code has expired, please initiate a new login request to receive a fresh security code.
  
  When logging in, enter the security code provided above in the designated field on the login screen. This code helps protect your account from unauthorized access and ensures that only you can log in to your account.
  
  If you encounter any difficulties during the login process or have any concerns regarding your account security, please do not hesitate to reach out to our support team. We are here to assist you.
  
  Thank you for your attention to account security. We appreciate your trust and cooperation in maintaining a secure environment for all our users.
  <br>
  Best regards,</p>
  <br>
  <strong>Prince<strong/><br>
  <strong>Strrings Developer<strong/>`,
    },
    login_notification: {
      subject: `Account Login Notification`,
      html: `Dear ${username},
  
  <p>We hope this email finds you well. We wanted to inform you about recent activity on your account. We have detected a login to your account from a new device or location. As part of our security measures, we want to keep you informed and ensure that you are aware of any access to your account.
  If you recently logged in to your account, you can disregard this email. However, if you did not initiate this login or if you suspect any unauthorized access, we highly recommend taking immediate action to secure your account.</p>

  <br>
  <strong>Here are a few steps you can take to ensure the security of your account:</strong>
  <br>
  
  <ul>
  <li>Change your password: We advise changing your account password immediately if you suspect any unauthorized access. Make sure to choose a strong, unique password that is not easily guessable.</li>
  <li>Enable two-factor authentication (2FA): Two-factor authentication adds an extra layer of security to your account by requiring a second verification step, usually through a mobile app or text message. We strongly encourage you to enable 2FA for enhanced protection.</li>
  <li>Review your account activity: Take a moment to review your recent account activity and transactions. If you notice any unfamiliar or suspicious activity, please notify us immediately.</li>
  <li>Contact our support team: If you believe your account has been compromised or have any concerns regarding your account security, please reach out to our support team. We are here to assist you and address any questions or issues you may have.</li>
  </ul>

  <br>
  <strong>Based on our records, here is the information regarding the recent login to your account:</strong>
  <br>

<ul>
  <li>Date and Time: ${indianTime[0]} ${indianTime[1]}</li>
  <li>Location: Not available</li>
  <li>Browser: ${secret?.browser}</li>
  <li>Operating System: ${secret?.os}</li>
   </ul>

  <p>If you do not recognize this login or if it appears suspicious to you, please take the necessary steps to secure your account as mentioned above. Additionally, feel free to contact our support team for further assistance.</p>
  
  <p>At Strrings, we take the security of your account and personal information very seriously. We have implemented various measures to protect your data and maintain a secure environment.

  If you have any questions or need further assistance, please do not hesitate to contact us. We are committed to providing you with a safe and secure experience on our platform.
  
  Thank you for your attention to this matter.
  <br>
  Best regards,</p>
  <br>
  <strong>Prince<strong/><br>
  <strong>Strrings Developer<strong/>`,
    },
  };

  try {
    let sendToMe = type === "feedback" ? sender.user : email;
    await transport.sendMail({
      from: sender.user,
      to: sendToMe,
      subject: body[type].subject,
      html: body[type].html,
    });
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Email not sent !" };
  }
};

module.exports = { sendConfirmationEmail };
