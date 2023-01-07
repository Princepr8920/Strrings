module.exports = class Secure {
  filterInfo(
    info,
    out = [
      "__v",
      "_id",
      "password",
      "requestsToken",
      "provider",
      "confirmationCode",
      "refreshToken",
      "securityToken",
      "user_logs", 
      "userRequests"
    ]
  ) {
    let exclude = out;
    let filterdInfo = info;
    if (Array.isArray(info)) {
      info.forEach((doc) => {
        exclude.forEach((elem) => {
          if (doc[elem]) {
            delete doc[elem];
          }
        });
      });
    } else {
      exclude.forEach((elem) => {
        if (filterdInfo[elem]) {
          delete filterdInfo[elem];
        }
      });
    }
    return filterdInfo;
  }

  hint(email) {
    let cut = email.split("@");
    let len = Math.round(cut[0].length / 2);
    let hide = cut[0].split("").splice(0, len).join("");
    let star = "*";
    while (len > star.length) {
      star += "*";
    }
    let result = email.replace(hide, star);
    return result;
  }
};
