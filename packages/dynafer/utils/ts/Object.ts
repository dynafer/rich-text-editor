import { IsFunction, IsObject } from './Type';

export const Entries = <T>(obj: Record<string, T> | ArrayLike<T>, callback?: (key: string, value: T, exit: () => void) => void): [string, T][] => {
	if (!IsObject(obj)) return [];

	const entries = Object.entries(obj);
	if (!IsFunction(callback)) return entries;

	const length = entries.length;
	for (let index = 0; index < length; ++index) {
		const entry = entries[index];
		callback(entry[0], entry[1], () => { index = length; });
	}

	return entries;
};

export const Keys = <T>(obj: Record<string, T> | ArrayLike<T>, callback?: (value: string, exit: () => void) => void): string[] => {
	if (!IsObject(obj)) return [];

	const keys = Object.keys(obj);
	if (!IsFunction(callback)) return keys;

	const length = keys.length;
	for (let index = 0; index < length; ++index) {
		const key = keys[index];
		callback(key, () => { index = length; });
	}

	return keys;
};

export const Values = <T>(obj: Record<string, T> | ArrayLike<T>, callback?: (value: T, exit: () => void) => void): T[] => {
	if (!IsObject(obj)) return [];

	const values = Object.values(obj);
	if (!IsFunction(callback)) return values;

	const length = values.length;
	for (let index = 0; index < length; ++index) {
		const value = values[index];
		callback(value, () => { index = length; });
	}

	return values;
};