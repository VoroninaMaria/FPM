import admin from "./admin.js";
import category from "./category.js";
import merchants from "./merchants.js";
import self from "./self.js";
import tag from "./tag.js";
import file from "./file.js";
import discount from "./discount.js";
import location from "./location.js";
import hall from "./hall.js";
import movie from "./movie.js";
import session from "./session.js";

export default {
  ...admin,
  ...hall,
  self,
  ...merchants,
  ...category,
  ...tag,
  ...file,
  ...discount,
  ...location,
  ...movie,
  ...session,
};
