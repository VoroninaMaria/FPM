import self from "./self.js";
import promotion from "./promotion.js";
import { allTransactions } from "./transaction.js";
import { allPaymentTransactions } from "./payment_transactions.js";
import qrCard from "./qrCard.js";
import getJurQRCard from "./getJurQRCard.js";
import getBalance from "./getBalance.js";
import { stella } from "./stella.js";

export default {
  self,
  ...promotion,
  allTransactions,
  allPaymentTransactions,
  qrCard,
  getJurQRCard,
  getBalance,
  stella,
};
