import admin from "./admin.js";
import category from "./category.js";
import merchants from "./merchants.js";
import self from "./self.js";
import tag from "./tag.js";
import file from "./file.js";
import discount from "./discount.js";
import location from "./location.js";

export default {
  ...admin,
  self,
  ...merchants,
  ...category,
  ...tag,
  ...file,
  ...discount,
  ...location,
};
