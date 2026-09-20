import ptBR from "./pt-BR.js";
import en from "./en.js";

const translations = { "pt-BR": ptBR, en };
const STORAGE_KEY = "woodbox-language-preference";
const CHANGE_EVENT = "woodbox:languagechange";

let currentLang = detectInitialLanguage();

function detectInitialLanguage() {
  const browserLanguage = navigator.languages?.[0] || navigator.language || "en";
  let lang = /^pt(?:-|$)/i.test(browserLanguage) ? "pt-BR" : "en";

  try {
    // The old key also stored automatic defaults, not just explicit choices.
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (translations[savedLang]) lang = savedLang;
  } catch {
    // The page remains usable when browser storage is unavailable.
  }
  return lang;
}

export function getLang() {
  return currentLang;
}

export function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

/** Runs `callback` every time the language is applied, so features never import each other. */
export function onLanguageChange(callback) {
  document.addEventListener(CHANGE_EVENT, () => callback(currentLang));
}

export function applyLanguage(lang, remember = false) {
  currentLang = translations[lang] ? lang : "en";
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, currentLang);
    } catch {
      // Language changes still work without persistence.
    }
  }
  document.documentElement.lang = currentLang;
  document.title = t("meta.title");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attribute, key] = pair.split(":").map((value) => value.trim());
      if (attribute && key) element.setAttribute(attribute, t(key));
    });
  });

  document.querySelectorAll(".lang-option").forEach((button) => {
    const active = button.dataset.lang === currentLang;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  document.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function initI18n() {
  document.querySelectorAll(".lang-option").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang, true));
  });
  applyLanguage(currentLang);
}
