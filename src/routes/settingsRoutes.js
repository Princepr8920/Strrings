const express = require("express"),
  routes = express.Router(),
  upload = require("../middleware/multer"),
  logout = require("../controllers/afterAuth/settings/logout"),
  {appearance,customBackground} = require("../controllers/afterAuth/settings/appearance"),
  {
    setNotifications,
    notification_permission,
  } = require("../controllers/afterAuth/settings/notifications"),
  feedback = require("../controllers/afterAuth/settings/feedback"),
  {
    validator,
    notificationsValidation,
    permissionValidation,
    securityValidation,
    passwordValidation,
  } = require("../middleware/validator"),
  blockedContacts = require("../controllers/afterAuth/settings/blockedcontacts"),
  {
    updatePassword,
    updateSecurity,
  } = require("../controllers/afterAuth/settings/updateSecurity");

routes.put("/account/settings/appearance", appearance);

routes.put("/account/settings/appearance/custom-bg",upload("current_bg",['image/jpeg', 'image/png']), customBackground);

routes.get("/account/settings/blocked-contacts", blockedContacts);

routes.put(
  "/account/settings/notifications",
  notificationsValidation,
  validator,
  setNotifications
);

routes.put(
  "/user/account/manage/security",
  securityValidation,
  validator,
  updateSecurity
);

routes.patch(
  "/user/account/manage/password",
  passwordValidation,
  validator,
  updatePassword
);

routes.put(
  "/account/settings/notifications-permission",
  permissionValidation,
  validator,
  notification_permission
);

routes.get("/logout", logout);

routes.post("/user/feedback", feedback);

module.exports = routes;
