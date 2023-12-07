let admin = require("firebase-admin");

function cloudMessaging() {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FCM_CREDENTIALS)),
  });
  console.log("Notification service enabled successfully 🔔");
}

module.exports = cloudMessaging;
