import polyglotI18nProvider from "ra-i18n-polyglot";
import { uk, en } from "../locales/index.js";

const translations = {
  en: { component: { record: "record" }, ...en },
  uk: { component: { record: "record" }, ...uk },
};

const i18nProvider = polyglotI18nProvider(
  (locale) => translations[locale],
  "uk",
  [
    { locale: "en", name: "English" },
    { locale: "uk", name: "Українська" },
  ],
  {
    allowMissing: true,
  }
);

export default i18nProvider;
