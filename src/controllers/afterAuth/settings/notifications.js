const { Update_Error } = require("../../../service/handleErrors"),
  { database } = require("../../../loaders/mongodb"),
  userDb = database("userCollection"),
  filterInstance = require("../../../utils/filterInfo"),
  FILTER = new filterInstance();

const setNotifications = async (req, res, next) => {
  let token = req.cookies.strrings_connect;
  let changes = req.body;
  let user = await userDb.findOne({ "tokens.refreshToken": token });

  try {
    if (user) {
      if (user?.notifications?.notification_permission?.permission) {
        const updatedInfo = await userDb.findOneAndUpdate(
          { "tokens.refreshToken": token },
          {
            $set: { notifications: { ...user?.notifications, ...changes } },
          },
          {
            returnDocument: "after",
          }
        );

        if (updatedInfo.value) {
          const filteredInfo = FILTER.filterInfo(updatedInfo.value);
          return res.status(200).json({
            user: filteredInfo,
            success: true,
            message: changes.message_notification
              ? "Message Notification enabled"
              : "Message Notification disabled",
          });
        } else {
          throw new Update_Error(
            "Message notificaiton couldn't be enabled!",
            500
          );
        }
      } else {
        throw new Update_Error("Notification Permission required", 400);
      }
    } else {
      throw new Update_Error("Message notificaiton couldn't be enabled!", 500);
    }
  } catch (error) {
    return next(error);
  }
};

const notification_permission = async (req, res, next) => {
  let token = req.cookies?.strrings_connect;
  let { notification_permission } = req.body;

  try {
    const updatedInfo = await userDb.findOneAndUpdate(
      { "tokens.refreshToken": token },
      {
        $set: {
          "notifications.notification_permission": notification_permission,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (updatedInfo.value) {
      const filteredInfo = FILTER.filterInfo(updatedInfo.value);
      return res.status(200).json({
        user: filteredInfo,
        success: true,
        message: notification_permission.permission
          ? "Notifications enabled"
          : "Notifications disabled",
      });
    } else {
      throw new Update_Error("Notifications couldn't be enabled!", 500);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { setNotifications, notification_permission };
