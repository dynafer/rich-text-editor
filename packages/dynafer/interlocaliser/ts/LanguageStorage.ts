import { Obj, Type } from '@dynafer/utils';

export interface ILanguageStorage {
	readonly Languages: Record<string, Record<string, string>>,
	Add: (language: string, key: string, value: string) => void,
	AddMap: (language: string, map: Record<string, string>) => void,
	Get: (language: string, key: string) => string | null,
	Remove: (key: string) => boolean,
}

const LanguageStorage = (): ILanguageStorage => {
	const Languages: Record<string, Record<string, string>> = {};

	const Add = (language: string, key: string, value: string) => {
		if (!Type.IsString(language)) return;

		if (!Languages[language]) Languages[language] = {};
		Languages[language][key] = value;
	};

	const AddMap = (language: string, map: Record<string, string>) =>
		Obj.Entries(map, (key, value) => Add(language, key, value));

	const Get = (language: string, key: string): string | null => Languages[language]?.[key] ?? null;

	const Remove = (key: string): boolean => delete Languages?.[key];

	return {
		Languages,
		Add,
		AddMap,
		Get,
		Remove,
	};
};

export default LanguageStorage();