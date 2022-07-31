const fetch = require("node-fetch");

let unsplash = async () => {
  let info = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
  };
  fetch(
    `https://api.unsplash.com/photos/?client_id=${process.env.UNSPLASH_API_KEY}`,
    info
  ).then(res=>res.json()).then(res=>console.log(res))
};

module.exports = unsplash