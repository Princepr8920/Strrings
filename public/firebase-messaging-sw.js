// eslint-disable-next-line no-undef
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
// eslint-disable-next-line no-undef
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCF_Um5g2s2M4U-2gKuSAK6GvLVQryZRsE",
  authDomain: "strrings-29a9e.firebaseapp.com",
  projectId: "strrings-29a9e",
  storageBucket: "strrings-29a9e.appspot.com",
  messagingSenderId: "252292433754",
  appId: "1:252292433754:web:3f5975fab968d203e6d563",
  measurementId: "G-EYZJ0GQKXM"
};


// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.image,
  };

  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 I got the above code from https://github.com/firebase/quickstart-js/blob/master/messaging/firebase-messaging-sw.js
 */
















// import { getMessaging } from "firebase/messaging/sw";
// import { onBackgroundMessage } from "firebase/messaging/sw";

// const messaging = getMessaging();

// onBackgroundMessage(messaging, (payload) => {
//   // Customize notification here
//   const notificationTitle = payload.notification.title;

//   const notificationOptions = {
//     body: payload.notification.body,
//     image: payload.notification.image,
//     icon:payload.notification.image
//   };

//   // eslint-disable-next-line no-restricted-globals
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

/**
 The above code is also working good but 
 when we use this code, Microsoft edge 
 browser will not able to enable push notification.
 But this code run with other browser like chrome and mozila.
 */
