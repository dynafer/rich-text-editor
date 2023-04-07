import { Obj } from '@dynafer/utils';

const LanguageStorage = () => {
	const languageMap: Record<string, string> = {};

	const Add = (key: string, value: string) => {
		languageMap[key] = value;
	};

	const AddMap = (map: Record<string, string>) =>
		Obj.Entries(map, (key, value) => Add(key, value));

	const Get = (key: string): string | null => languageMap[key] ?? null;

	const Remove = (key: string): boolean => delete languageMap?.[key];

	return {
		Add,
		AddMap,
		Get,
		Remove,
	};
};

export default LanguageStorage();