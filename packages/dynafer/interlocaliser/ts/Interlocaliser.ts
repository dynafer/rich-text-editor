import LanguageStorage from './LanguageStorage';
import { LANGUAGE_CODES, LANGUAGES } from './Utils';

export interface IInterlocaliser {
	readonly LANGUAGE_CODES: Record<string, string>,
	readonly LANGUAGES: Record<string, string>,
	Register: (map: Record<string, string>) => void,
	Get: (key: string, defaultText: string) => string,
}

const Interlocaliser = (): IInterlocaliser => {
	const storage = LanguageStorage;

	const Register = (map: Record<string, string>) => storage.AddMap(map);

	const Get = (key: string, defaultText: string): string => storage.Get(key) ?? defaultText;

	return {
		LANGUAGE_CODES,
		LANGUAGES,
		Register,
		Get,
	};
};

export default Interlocaliser();