const axios = require("axios");
exports.axiosdata = function (method, url, jwt, data) {
  // console.log("url", data);
  return axios({
    method: method,
    url: process.env.BASE_URL + url,
    headers: {
      "x-access-token": jwt,
    },
    data: data
  })
};

