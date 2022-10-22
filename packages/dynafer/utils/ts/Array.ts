import { IsArray } from './Type';

export const IsEmpty: (value: unknown) => boolean = (value) => IsArray(value) && value.length === 0;

export const UniqueMerge = <T extends object>(...arrays: T[][]): T[] => {
	let newSet: T[] = [];
	for (const array of arrays) {
		if (!IsArray(array) || IsEmpty(array)) continue;
		newSet = [...new Set([...newSet, ...array])];
	}
	return newSet;
};