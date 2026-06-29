import { useUIStore } from '../../store';
import ru from './ru';
import en from './en';
import hy from './hy';

export type Locale = 'ru' | 'en' | 'hy';

const dictionaries: Record<Locale, Record<string, string>> = { ru, en, hy };

export function useTranslation() {
  const locale = useUIStore((state) => state.locale);
  const dict = dictionaries[locale] || dictionaries.ru;

  const t = (key: string): string => {
    return dict[key] || key;
  };

  return { t, locale };
}
