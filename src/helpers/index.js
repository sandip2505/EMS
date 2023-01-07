const axios = require("axios");
const settings = require("../model/settings");
exports.axiosdata = function (method, url, jwt, data) {
    // console.log("url", url);
  return axios({
    method: method,
    url: process.env.BASE_URL + url,
    headers: {
      "x-access-token": jwt,
    },
    data: data
  })
};


exports.getSettingData = async function (key) {
   const settingData = await settings.find({ key: key })
   console.log("settingData",settingData)
    return  settingData[0].value;
};
