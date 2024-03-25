import category from "./category.js";
import client from "./client.js";
import merchant from "./merchant.js";
import self from "./self.js";
import sms_services from "./sms_services.js";
import tag from "./tag.js";
import file from "./file.js";
import discount from "./discount.js";
import location from "./location.js";
import membership from "./membership.js";

export default {
  self,
  ...merchant,
  ...sms_services,
  ...category,
  ...tag,
  ...file,
  ...client,
  ...discount,
  ...location,
  ...membership,
};
