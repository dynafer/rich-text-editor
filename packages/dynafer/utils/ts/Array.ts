import { IsArray, IsFunction } from './Type';

export const IsEmpty: (value: unknown) => boolean = (value) => IsArray(value) && value.length === 0;

export const MergeUnique = <T>(...arrays: T[][]): T[] => {
	let newArray: T[] = [];
	for (const array of arrays) {
		if (!IsArray(array) || IsEmpty(array)) continue;
		newArray = [...new Set([...newArray, ...array])];
	}
	return newArray;
};

export const Merge = <T>(...arrays: T[][]): T[] => {
	let newArray: T[] = [];
	for (const array of arrays) {
		newArray = [...newArray, ...array];
	}
	return newArray;
};

export const Reverse = <T>(array: T[]): T[] => {
	const reversed: T[] = [];
	for (const item of array) {
		reversed.unshift(item);
	}
	return reversed;
};

export const Contains = <T>(array: T[], expect: T): boolean => IsArray(array) && array.includes(expect);

export const Push = <T>(array: T[], ...items: T[]): number => array.push(...items);
export const Pop = <T>(array: T[]): T | undefined => array.pop();

export const Unshift = <T>(array: T[], ...items: T[]): number => array.unshift(...items);
export const Shift = <T>(array: T[]): T | undefined => array.shift();

export const CompareAndGetStartIndex = <T>(bigArray: T[], smallArray: T[]): number =>
	IsArray(bigArray) && !IsEmpty(bigArray) && IsArray(smallArray) && !IsEmpty(smallArray)
		? bigArray.indexOf(smallArray[0])
		: -1;

export const CompareAndGetEndIndex = <T>(bigArray: T[], smallArray: T[]): number =>
	IsArray(bigArray) && !IsEmpty(bigArray) && IsArray(smallArray) && !IsEmpty(smallArray)
		? bigArray.indexOf(smallArray[smallArray.length - 1])
		: -1;

export const Clean = <T>(array: T[]): T[] => array.splice(0, array.length);

export const Find = <T>(array: unknown, target: T): number => {
	if (IsArray(array)) return array.indexOf(target);

	if (!IsFunction((array as T[])[Symbol.iterator])) return -1;

	let index = 0;
	for (const item of array as T[]) {
		if (item === target) return index;
		++index;
	}

	return -1;
};

export const Compare = <T>(array: T[], compare: T[]): boolean => {
	if (array.length !== compare.length) return false;

	for (let index = 0, length = array.length; index < length; ++index) {
		if (array[index] !== compare[index]) return false;
	}

	return true;
};