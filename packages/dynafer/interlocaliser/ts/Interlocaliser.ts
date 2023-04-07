import LanguageStorage from './LanguageStorage';
import { LANGUAGE_CODES, LANGUAGES } from './Utils';

export interface IInterlocaliser {
	readonly LANGUAGE_CODES: Record<string, string>,
	readonly LANGUAGES: Record<string, string>,
	Register: (map: Record<string, string>) => void,
	Get: (key: string) => string | null,
}

const Interlocaliser = (): IInterlocaliser => {
	const storage = LanguageStorage;

	const Register = (map: Record<string, string>) => storage.AddMap(map);

	const Get = (key: string): string | null => storage.Get(key);

	return {
		LANGUAGE_CODES,
		LANGUAGES,
		Register,
		Get,
	};
};

export default Interlocaliser();