import { useUIStore } from '../../store';
import ru from './ru';
import en from './en';
import hy from './hy';

export type Locale = 'ru' | 'en' | 'hy';

const dictionaries: Record<Locale, Record<string, string>> = { ru, en, hy };

import { useCallback } from 'react';

export function useTranslation() {
  const locale = useUIStore((state) => state.locale);
  const dict = dictionaries[locale] || dictionaries.ru;

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let str = dict[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  }, [dict]);

  return { t, locale };
}
