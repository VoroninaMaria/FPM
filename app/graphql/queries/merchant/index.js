import category from "./category.js";
import merchant from "./merchant.js";
import self from "./self.js";
import tag from "./tag.js";
import file from "./file.js";
import discount from "./discount.js";
import location from "./location.js";

export default {
  self,
  ...merchant,
  ...category,
  ...tag,
  ...file,
  ...discount,
  ...location,
};
