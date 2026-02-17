import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslationValue } from '../locales/translations';

const formatTemplate = (template: string, params?: Record<string, string | number>) => {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(.*?)\}\}/g, (_match, rawKey) => {
    const key = String(rawKey).trim();
    const value = params[key];
    return value === undefined ? '' : String(value);
  });
};

export function useI18n() {
  const { language } = useApp();

  return useMemo(
    () => ({
      language,
      t: (key: string, params?: Record<string, string | number>) => {
        const value = getTranslationValue(language, key);
        if (typeof value !== 'string') {
          return key;
        }
        return formatTemplate(value, params);
      },
      list: (key: string) => {
        const value = getTranslationValue(language, key);
        return Array.isArray(value) ? value : [];
      }
    }),
    [language]
  );
}
