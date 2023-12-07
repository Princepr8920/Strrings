const emailSender = require("../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  { database } = require("../loaders/mongodb"),
  userDb = database("userCollection");

async function requestManager(newdata, oldData) {
  try {
    await userDb.findOneAndUpdate(
      /* Set user email request so we use this requested email to
       send email and later we will set user account email*/
      { userID: oldData.userID },
      {
        $set: {
          "userRequests.emailRequest": {
            requestedEmail: newdata.email,
            issueAt: new Date(),
          },
        },
      }
    );

    const emailSuccess = await sendNewEmail.sendEmail({
      userID: oldData.userID,
      email: newdata.email,
      type: "verify_Email",
      resend: false,
    });

    return emailSuccess;
  } catch (error) {
    error.success = false
    return error;
  }
}
module.exports = { requestManager };
