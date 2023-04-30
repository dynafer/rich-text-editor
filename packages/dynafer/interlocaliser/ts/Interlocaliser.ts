import LanguageStorage, { ILanguageStorage } from './LanguageStorage';
import { LANGUAGE_CODES, LANGUAGES } from './Utils';

export interface IInterlocaliser {
	readonly LANGUAGE_CODES: Record<string, string>,
	readonly LANGUAGES: Record<string, string>,
	readonly Storage: ILanguageStorage,
	Register: (language: string, map: Record<string, string>) => void,
	Get: (language: string, key: string) => string | null,
}

const Interlocaliser = (): IInterlocaliser => {
	const Storage = LanguageStorage;

	const Register = (language: string, map: Record<string, string>) => Storage.AddMap(language, map);

	const Get = (language: string, key: string): string | null => Storage.Get(language, key) ?? null;

	return {
		LANGUAGE_CODES,
		LANGUAGES,
		Storage,
		Register,
		Get,
	};
};

export default Interlocaliser();