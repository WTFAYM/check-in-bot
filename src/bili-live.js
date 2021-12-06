require('dotenv').config();
const { Axios } = require("axios");
const { sendMail } = require('./utils/mail');
const cookie = process.env.BILI_COOKIE;

const axios = new Axios({
  headers: {
    cookie,
  },
  withCredentials: true,
});
axios.interceptors.response.use((res) => {
  return JSON.parse(res.data);
});

const checkIn = async () => {
  const res = await axios.get('https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign');
  if (!res || res.code) {
    sendMail('[FAIL] check-in bot bili', res && res.message);
    return console.error(res && res.message);
  }
  const { hadSignDays, allDays, text, specialText } = res.data || {};
  sendMail('[签] check-in bot bili', `签到成功，本月（${hadSignDays}/${allDays}），${text}，${specialText}`);
  console.log(`签到成功，本月（${hadSignDays}/${allDays}），${text}，${specialText}`);
};

if (!cookie) {
  sendMail("[FAIL] check-in bot", "bili-live 未设置环境变量 cookie");
  return console.error("未设置环境变量 cookie");
}
checkIn();
