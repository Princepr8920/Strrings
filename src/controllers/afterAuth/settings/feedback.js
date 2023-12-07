const { Service_Error } = require("../../../service/handleErrors"),
  emailSender = require("../../../service/confirmationCode"),
  sendNewEmail = new emailSender(),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection");

const feedback = async (req, res, next) => {
  let token = req.cookies.strrings_connect;
  let message = req.body.message;

  try {
    let saveFeedback = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": token},
      {
        $push: {
          feedback: {
            message: message,
            receivedAt: new Date(),
          },
        },
      }
    );

    if (!saveFeedback.value) {
      throw new Service_Error("Message couldn't be sent", 500);
    }

    let emailSent = await sendNewEmail.feedback({
      username: saveFeedback.value.username,
      email: saveFeedback.value.email,
      message,
    });

    if (saveFeedback && emailSent.success) {
      return res.status(200).json(emailSent);
    } else {
      throw new Service_Error(emailSent.message, emailSent.status);
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = feedback;
