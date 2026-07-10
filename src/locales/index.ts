import { en, Locale } from './en';
import { ru } from './ru';

const locales: Record<string, Locale> = { en, ru };

function detectLocale(): Locale {
	const lang = (navigator.language || 'en').slice(0, 2);
	return locales[lang] || en;
}

export const locale = detectLocale();
export type { Locale };
