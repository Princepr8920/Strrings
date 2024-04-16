const { getMessaging } = require("firebase-admin/messaging"),
  { database } = require("../../loaders/mongodb"),
  userDb = database("userCollection");

async function pushNotification(userIDs, message) {
  let users = await userDb.find({ userID: { $in: userIDs } }).toArray();
  let [sender, receiver] =
    users[0].userID === userIDs[1]
      ? [users[1], users[0]]
      : [users[0], users[1]];

  if (
    receiver.notifications.message_notification &&
    receiver.notifications.notification_permission.permission
  ) {
    sendNotification({
      body: `${sender.username} : ${message.content}`,
      image: sender.picture,
      link: "https://www.strrings.com", // open chats when user click on notification
      token: receiver.notifications.notification_permission.token,
    });
    return;
  }

  function sendNotification({ image, body, link, token }) {
    const message = {
      data: {
        title: `Strrings`,
        body,
        image,
      },
      token,
      webpush: {
        fcm_options: {
          link,
        },
      },
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    getMessaging()
      .send(message)
      .then((res) => {
        console.log(`Notification sent successfully : ${res}`);
      })
      .catch((error) => {
        console.log(`Error sending notification : ${error}`);
      });
    return;
  }
}

module.exports = pushNotification;
