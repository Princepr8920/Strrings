const emailSender = require("../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  { updateUserData } = require("../database/database");

async function requestManager(newdata, oldData) {
  let isRequested = oldData.userRequests.emailRequests.length;


  /// To remove old emailRequests
  if (isRequested) {
    await updateUserData(
      { userID: oldData.userID },
      { $pop: { "userRequests.emailRequests": -1 } }
    );
  }

// To add new emailRequests
  await updateUserData(
    { userID: oldData.userID },
    {
      $push: {
        "userRequests.emailRequests": {
          requestedEmail: newdata.email,
          issueAt: new Date(),
        },
      },
    }
  );
  const emailSuccess = await sendNewEmail.sendEmail(
    oldData.userID,
    newdata.email,
    "verify_Email",
    false
  );

  return emailSuccess;
}
module.exports = { requestManager };
