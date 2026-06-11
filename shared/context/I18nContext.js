import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../i18n/locales/en.json';
import ar from '../i18n/locales/ar.json';

I18nManager.allowRTL(true);
I18nManager.swapLeftAndRightInRTL(false);

const STORAGE_KEY = 'app_language';
const locales = { en, ar };

function resolveValue(obj, key, params = {}) {
  const keys = key.split('.');
  let value = obj;
  for (const k of keys) {
    if (value && typeof value === 'object') value = value[k];
    else return key;
  }
  if (typeof value === 'string') {
    return value.replace(/{{(\w+)}}/g, (_, k) => params[k] ?? `{{${k}}}`);
  }
  return key;
}

function translate(lang, key, params) {
  const result = resolveValue(locales[lang], key, params);
  if (result !== key) return result;
  return resolveValue(locales.en, key, params);
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && locales[stored]) {
        setLanguageState(stored);
        I18nManager.forceRTL(stored === 'ar');
      }
      setLoaded(true);
    });
  }, []);

  const t = useCallback((key, params) => translate(language, key, params), [language]);

  const setLanguage = useCallback((lang) => {
    if (!locales[lang]) return;
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(lang === 'ar');
  }, []);

  // Ensure the provider is mounted immediately so hooks in children
  // can safely call `useTranslation` while language loads.

  return (
    <I18nContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used inside I18nProvider');
  return ctx;
}
