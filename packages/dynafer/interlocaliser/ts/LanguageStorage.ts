import { Obj, Type } from '@dynafer/utils';

const LanguageStorage = () => {
	const languageMap: Record<string, Record<string, string>> = {};

	const Add = (language: string, key: string, value: string) => {
		if (!Type.IsString(language)) return;

		if (!languageMap[language]) languageMap[language] = {};
		languageMap[language][key] = value;
	};

	const AddMap = (language: string, map: Record<string, string>) =>
		Obj.Entries(map, (key, value) => Add(language, key, value));

	const Get = (language: string, key: string): string | null => languageMap[language]?.[key] ?? null;

	const Remove = (key: string): boolean => delete languageMap?.[key];

	return {
		Add,
		AddMap,
		Get,
		Remove,
	};
};

export default LanguageStorage();