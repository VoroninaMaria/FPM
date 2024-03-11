import brand from "./brand.js";
import brand_merchant from "./brand_merchant.js";
import blocks from "./block.js";
import category from "./category.js";
import client from "./client.js";
import design from "./design.js";
import merchant from "./merchant.js";
import page from "./page.js";
import self from "./self.js";
import sms_services from "./sms_services.js";
import tag from "./tag.js";
import file from "./file.js";
import promotion from "./promotion.js";
import payment_gateways from "./payment_gateway.js";
import merchant_payment_gateways from "./merchant_payment_gateways.js";
import gas_brand from "./gas_brand.js";
import gas_brand_merchant from "./gas_brand_merchant.js";
import transaction from "./transaction.js";
import trunc from "./trunc.js";

export default {
  self,
  ...merchant,
  ...sms_services,
  ...category,
  ...tag,
  ...file,
  ...brand_merchant,
  ...brand,
  ...blocks,
  ...client,
  ...design,
  ...payment_gateways,
  ...merchant_payment_gateways,
  ...page,
  ...promotion,
  ...gas_brand,
  ...gas_brand_merchant,
  ...transaction,
  ...trunc,
};
