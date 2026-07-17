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

  const t = useCallback((key: string): string => {
    return dict[key] || key;
  }, [dict]);

  return { t, locale };
}
