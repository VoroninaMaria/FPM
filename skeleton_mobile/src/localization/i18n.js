import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "intl-pluralrules";

import ukrainian from "../locale/uk.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "uk",

  resources: {
    uk: ukrainian,
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
