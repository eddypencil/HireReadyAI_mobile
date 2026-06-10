import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import ar from './locales/ar.json';

const STORAGE_KEY = 'app_language';

const locales = { en, ar };

let currentLanguage = 'en';
let listeners = [];

export async function initI18n() {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const lang = stored && locales[stored] ? stored : 'en';
  currentLanguage = lang;
  return lang;
}

export function t(key, params = {}) {
  const keys = key.split('.');
  let value = locales[currentLanguage];
  for (const k of keys) {
    if (value && typeof value === 'object') value = value[k];
    else {
      value = locales.en;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }

  if (typeof value === 'string') {
    return value.replace(/{{(\w+)}}/g, (_, k) => params[k] ?? `{{${k}}}`);
  }

  let fv = locales.en;
  for (const k of keys) {
    fv = fv?.[k];
  }
  if (typeof fv === 'string') {
    return fv.replace(/{{(\w+)}}/g, (_, k) => params[k] ?? `{{${k}}}`);
  }

  return key;
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  if (!locales[lang]) return;
  currentLanguage = lang;
  AsyncStorage.setItem(STORAGE_KEY, lang);
  listeners.forEach((fn) => fn(lang));
}

export function onLanguageChange(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export { currentLanguage };
