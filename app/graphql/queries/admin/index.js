import admin from "./admin.js";
import category from "./category.js";
import clients from "./clients.js";
import merchants from "./merchants.js";
import self from "./self.js";
import sms_services from "./sms_services.js";
import tag from "./tag.js";
import file from "./file.js";
import discount from "./discount.js";
import location from "./location.js";
import membership from "./membership.js";

export default {
  ...admin,
  ...clients,
  self,
  ...merchants,
  ...sms_services,
  ...category,
  ...tag,
  ...file,
  ...discount,
  ...location,
  ...membership,
};
