require('dotenv').config();
const { Axios } = require("axios");
const { sendMail } = require('./utils/mail');
const cookie = process.env.JUEJIN_COOKIE;

const axios = new Axios({
  headers: {
    cookie,
  },
  withCredentials: true,
});
axios.interceptors.response.use((res) => {
  return JSON.parse(res.data);
});

const messages = [];

const drawFn = async () => {
  // 查询今日是否有免费抽奖机会
  const today = await axios.get(
    "https://api.juejin.cn/growth_api/v1/lottery_config/get"
  );

  if (today.err_no !== 0) {
    return messages.push("免费抽奖失败！");
  }
  if (today.data.free_count === 0) {
    return messages.push("今日已经免费抽奖！");
  }

  // 免费抽奖
  const draw = await axios.post(
    "https://api.juejin.cn/growth_api/v1/lottery/draw"
  );

  if (draw.err_no !== 0) {
    return messages.push("免费抽奖失败！");
  }
  if ([1, 2].includes(draw.data.lottery_type)) {
    messages.push(`恭喜抽到：${draw.data.lottery_name}`);
  } else {
    messages.push(`恭喜抽到：${draw.data.lottery_name}`);
  }
};

const checkIn = async () => {
  // 查询今日是否已经签到
  const today_status = await axios.get(
    "https://api.juejin.cn/growth_api/v1/get_today_status"
  );
  if (today_status.err_no !== 0) {
    return messages.push("签到失败！" + today_status.err_msg);
  }
  if (today_status.data) {
    messages.push("今日已经签到！");
    return drawFn();
  }

  // 签到
  const check_in = await axios.post(
    "https://api.juejin.cn/growth_api/v1/check_in"
  );

  if (check_in.err_no !== 0) {
    return messages.push("签到失败！");
  }
  messages.push(`签到成功！当前积分；${check_in.data.sum_point}`);
  return drawFn();
};

if (!cookie) {
  sendMail("[FAIL] check-in bot", "juejin 未设置环境变量 cookie");
  return console.error("未设置环境变量 cookie");
}
checkIn().then(() => {
  console.log(messages.join(" \n"));
  if (messages.length) {
    sendMail("自动签到【掘金】", messages.join(" \n"));
  }
});
