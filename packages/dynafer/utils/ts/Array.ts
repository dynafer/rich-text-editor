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

export const Merge = <T extends object>(...arrays: T[][]): T[] => {
	let newArray: T[] = [];
	for (const array of arrays) {
		newArray = [...newArray, ...array];
	}
	return newArray;
};

export const Reverse = <T>(array: T[]) => {
	const reversed: T[] = [];
	for (const item of array) {
		reversed.unshift(item);
	}
	return reversed;
};

export const Push = <T>(array: T[], ...items: T[]): number => array.push(...items);

export const Unshift = <T>(array: T[], ...items: T[]): number => array.unshift(...items);

export const CompareAndGetStartIndex = <T>(bigArray: T[], smallArray: T[]): number =>
	IsArray(bigArray) && !IsEmpty(bigArray) && IsArray(smallArray) && !IsEmpty(smallArray)
		? bigArray.indexOf(smallArray[0])
		: -1;

export const CompareAndGetEndIndex = <T>(bigArray: T[], smallArray: T[]): number =>
	IsArray(bigArray) && !IsEmpty(bigArray) && IsArray(smallArray) && !IsEmpty(smallArray)
		? bigArray.indexOf(smallArray[smallArray.length - 1])
		: -1;