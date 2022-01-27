require('dotenv').config();
const { Axios } = require("axios");
const { sendMail } = require('./utils/mail');
const cookie = process.env.JUEJIN_COOKIE;

const axios = new Axios({
  headers: {
    cookie,
    origin: 'https://juejin.cn',
    pragma: 'no-cache',
    referer: 'https://juejin.cn/',
    'sec-ch-ua':
        '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
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

const getLucky = async () => {
  try {
//     const res = await axios.post(
//       "https://api.juejin.cn/growth_api/v1/lottery_history/global_big",
//       JSON.stringify({ "page_no": 2, "page_size": 5 }),
//     );
//     console.log(res);
//     const history_id = res.data.lotteries[0].history_id;
    const res2 = await axios.post(
      "https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky?aid=2608",
//       JSON.stringify({ "lottery_history_id": history_id }),
    );
    console.log(res2.config);
    console.log(res2.data);
    const { total_value, dip_value, has_dip } = res2.data;
    messages.push((has_dip ? '[复]' : '') + "粘到了：" + dip_value + ' 点幸运值，共 ' + total_value + '/6000 点幸运值');
  } catch (e) {
    messages.push("粘幸运值报错：" + e.messages);
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
  await drawFn();
};

if (!cookie) {
  sendMail("[FAIL] check-in bot", "juejin 未设置环境变量 cookie");
  return console.error("未设置环境变量 cookie");
}
checkIn().then(async () => {
  await getLucky();
  console.log(messages.join(" \n"));
  if (messages.length) {
    sendMail("自动签到【掘金】", messages.join(" \n"));
  }
});
