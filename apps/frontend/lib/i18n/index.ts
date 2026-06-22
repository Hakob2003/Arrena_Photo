import { useUIStore } from '../../store';
import ru from './ru';
import en from './en';

export type Locale = 'ru' | 'en';

const dictionaries: Record<Locale, Record<string, string>> = { ru, en };

export function useTranslation() {
  const locale = useUIStore((state) => state.locale);
  const dict = dictionaries[locale] || dictionaries.ru;

  const t = (key: string): string => {
    return dict[key] || key;
  };

  return { t, locale };
}
