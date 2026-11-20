import { initHeaderTone } from "./header";
import { initI18n } from "./i18n";

initI18n();
initHeaderTone();

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());
