import { initI18n } from "./i18n";

initI18n();

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());
