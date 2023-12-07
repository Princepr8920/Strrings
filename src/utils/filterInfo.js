module.exports = class Secure {
  filterInfo(
    info,
    exclude = [
      "password",
      "_id",
      "confirmationCode",
      "userRequests",
      "verification",
      "tokens",
      "user_logs",
      "feedback",
      "provider",
      "__v"
    ]
  ) {
    function objFilter(infoObj, itemsToDelete = []) {
      for (let key in infoObj) {
        if (itemsToDelete.includes(key)) {
          delete infoObj[key];
        }
      }
      return infoObj;
    }

    if (Array.isArray(info)) {
      return info.map((e) => objFilter(e, exclude));
    }

    return objFilter(info, exclude);
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
