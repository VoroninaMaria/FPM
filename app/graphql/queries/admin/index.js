import admin from "./admin.js";
import brand from "./brand.js";
import brand_merchant from "./brand_merchant.js";
import category from "./category.js";
import clients from "./clients.js";
import merchants from "./merchants.js";
import self from "./self.js";
import sms_services from "./sms_services.js";
import tag from "./tag.js";
import blocks from "./block.js";
import design from "./design.js";
import page from "./page.js";
import file from "./file.js";
import payment_gateway from "./payment_gateway.js";
import merchant_payment_gateway from "./merchant_payment_gateway.js";
import promotion from "./promotion.js";
import company from "./company.js";
import manager from "./manager.js";
import gas_brand from "./gas_brand.js";
import gas_brand_merchant from "./gas_brand_merchant.js";

export default {
  ...admin,
  ...brand,
  ...brand_merchant,
  ...clients,
  self,
  ...payment_gateway,
  ...merchants,
  ...sms_services,
  ...category,
  ...tag,
  ...blocks,
  ...design,
  ...page,
  ...file,
  ...promotion,
  ...company,
  ...manager,
  ...merchant_payment_gateway,
  ...gas_brand,
  ...gas_brand_merchant,
};
