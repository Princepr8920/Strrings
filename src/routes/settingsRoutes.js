const express = require("express"),
  router = express.Router(),
  logout = require("../controllers/afterAuth/settings/logout"),
  { appearance } = require("../controllers/afterAuth/settings/appearance"),
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

// settings rotutes

router.put("/api/account/settings/appearance", appearance);

router.get("/api/account/settings/blocked-contacts", blockedContacts);

router.put(
  "/api/account/settings/notifications",
  notificationsValidation,
  validator,
  setNotifications
);

router.put(
  "/api/user/account/manage/security",
  securityValidation,
  validator,
  updateSecurity
);

router.patch(
  "/api/user/account/manage/password",
  passwordValidation,
  validator,
  updatePassword
);

router.put(
  "/api/account/settings/notifications-permission",
  permissionValidation,
  validator,
  notification_permission
);

router.get("/api/logout", logout);

router.post("/api/user/feedback", feedback);

module.exports = router;
