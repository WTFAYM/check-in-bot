const { Axios } = require("axios");
const cookie = process.env.cookie;

const axios = new Axios({
  headers: {
    cookie,
  },
  withCredentials: true,
});
axios.interceptors.response.use((res) => {
  return JSON.parse(res.data);
});

const drawFn = async () => {
  // 查询今日是否有免费抽奖机会
  const today = await axios.get(
    "https://api.juejin.cn/growth_api/v1/lottery_config/get"
  );

  if (today.err_no !== 0) return console.warn("免费抽奖失败！");
  if (today.data.free_count === 0) return console.log("今日已经免费抽奖！");

  // 免费抽奖
  const draw = await axios.post(
    "https://api.juejin.cn/growth_api/v1/lottery/draw"
  );

  if (draw.err_no !== 0) return console.warn("免费抽奖失败！");
  [3, 4].includes(draw.data.lottery_type)
    ? console.log(`恭喜抽到：${draw.data.lottery_name}`)
    : console.log(`恭喜抽到：${draw.data.lottery_name}`);
};

const checkIn = async () => {
  // 查询今日是否已经签到
  const today_status = await axios.get(
    "https://api.juejin.cn/growth_api/v1/get_today_status"
  );
  if (today_status.err_no !== 0)
    return console.warn("签到失败！" + today_status.err_msg);
  if (today_status.data) {
    console.log("今日已经签到！");
    drawFn();
    return;
  }

  // 签到
  const check_in = await axios.post(
    "https://api.juejin.cn/growth_api/v1/check_in"
  );

  if (check_in.err_no !== 0) return console.warn("签到失败！");
  console.log(`签到成功！当前积分；${check_in.data.sum_point}`);
  drawFn();
};

if (!cookie) {
  return console.error("未设置环境变量 cookie");
}
checkIn();
