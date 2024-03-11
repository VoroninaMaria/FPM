import { readFile } from "fs/promises";
const createUserFailResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/createUser.fail.json")
);
const createUserSuccessResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/createUser.success.json")
);
const historyFailResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/history.fail.json")
);
const historySuccessResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/history.success.json")
);
const getQrFailResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/getQr.fail.json")
);
const getQrSuccessResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/getQr.success.json")
);
const pricesFailResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/prices.fail.json")
);
const pricesSuccessResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/prices.success.json")
);
const topupFailResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/topup.fail.json")
);
const topupSuccessResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/topup.success.json")
);
const topupHistoryFailResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/topupHistory.fail.json")
);
const topupHistorySuccessResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/topupHistory.success.json")
);
const userBalanceFailResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/userBalance.fail.json")
);
const userBalanceSuccessResponse = JSON.parse(
  await readFile("./test/fixtures/brands/monobrand/userBalance.success.json")
);

export {
  createUserFailResponse,
  createUserSuccessResponse,
  historyFailResponse,
  historySuccessResponse,
  getQrFailResponse,
  getQrSuccessResponse,
  pricesFailResponse,
  pricesSuccessResponse,
  topupFailResponse,
  topupSuccessResponse,
  topupHistoryFailResponse,
  topupHistorySuccessResponse,
  userBalanceFailResponse,
  userBalanceSuccessResponse,
};
