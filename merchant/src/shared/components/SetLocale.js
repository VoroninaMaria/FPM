import moment from "moment";
import "moment/locale/uk.js";

const setLocale = (locale) => {
  moment.locale(locale);
};

export default setLocale;
