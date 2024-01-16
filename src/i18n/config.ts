import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "./locales/en-US.json";
import zhCN from "./locales/zh-CN.json";
import zhTW from "./locales/zh-TW.json";

const resources = {
  "en-US": {
    translation: { ...enUS },
  },
  "zh-CN": {
    translation: { ...zhCN },
  },
  "zh-TW": {
    translation: { ...zhTW },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en-US",
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
});
