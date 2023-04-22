import LanguageStorage from './LanguageStorage';
import { LANGUAGE_CODES, LANGUAGES } from './Utils';

export interface IInterlocaliser {
	readonly LANGUAGE_CODES: Record<string, string>,
	readonly LANGUAGES: Record<string, string>,
	Register: (language: string, map: Record<string, string>) => void,
	Get: (language: string, key: string) => string | null,
}

const Interlocaliser = (): IInterlocaliser => {
	const storage = LanguageStorage;

	const Register = (language: string, map: Record<string, string>) => storage.AddMap(language, map);

	const Get = (language: string, key: string): string | null => storage.Get(language, key) ?? null;

	return {
		LANGUAGE_CODES,
		LANGUAGES,
		Register,
		Get,
	};
};

export default Interlocaliser();