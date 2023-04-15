import { IsArray, IsFunction } from './Type';

export const IsEmpty: (value: unknown) => boolean = (value) => IsArray(value) && value.length === 0;

export const Each = <T>(array: ArrayLike<T>, callback: (value: T, exit: () => void) => void) => {
	const length = array.length;
	for (let index = 0; index < length; ++index) {
		const value = array[index];
		callback(value, () => { index = length; });
	}
};

export const Contains = <T>(array: T[], expect: T): boolean => IsArray(array) && array.includes(expect);

export const Push = <T>(array: T[], ...items: T[]): number => array.push(...items);
export const Pop = <T>(array: T[]): T | undefined => array.pop();

export const Unshift = <T>(array: T[], ...items: T[]): number => array.unshift(...items);
export const Shift = <T>(array: T[]): T | undefined => array.shift();

export const WhileShift = <T>(array: T[], callback: (value: T, exit: () => void) => void) => {
	let currentItem: T | undefined;
	let bBreak: boolean = false;
	const exit = () => { bBreak = true; };
	while (!IsEmpty(array)) {
		currentItem = Shift(array);
		if (!currentItem) continue;
		callback(currentItem, exit);
		if (bBreak) break;
	}
};

export const MergeUnique = <T>(...arrays: T[][]): T[] => {
	let newArray: T[] = [];
	Each(arrays, array => {
		if (!IsArray(array) || IsEmpty(array)) return;
		newArray = [...new Set([...newArray, ...array])];
	});
	return newArray;
};

export const Merge = <T>(...arrays: T[][]): T[] => {
	let newArray: T[] = [];
	Each(arrays, array => {
		newArray = [...newArray, ...array];
	});
	return newArray;
};

export const Reverse = <T>(array: T[]): T[] => {
	const reversed: T[] = [];
	Each(array, value => Unshift(reversed, value));
	return reversed;
};

export const CompareAndGetStartIndex = <T>(bigArray: T[], smallArray: T[]): number =>
	IsArray(bigArray) && !IsEmpty(bigArray) && IsArray(smallArray) && !IsEmpty(smallArray)
		? bigArray.indexOf(smallArray[0])
		: -1;

export const CompareAndGetEndIndex = <T>(bigArray: T[], smallArray: T[]): number =>
	IsArray(bigArray) && !IsEmpty(bigArray) && IsArray(smallArray) && !IsEmpty(smallArray)
		? bigArray.indexOf(smallArray[smallArray.length - 1])
		: -1;

export const Clean = <T>(array: T[]): T[] => array.splice(0, array.length);

export const Find = <T>(array: ArrayLike<unknown>, target: T): number => {
	if (IsArray(array)) return array.indexOf(target);

	if (!IsFunction((array as T[])[Symbol.iterator])) return -1;

	const length = array.length;
	for (let index = 0; index < length; ++index) {
		if (array[index] !== target) continue;
		return index;
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

export const Part = <T>(array: T[], start: number, end: number): T[] => array.slice(start, end);

export const FindAndRemove = <T>(array: T[], target: T): T[] | undefined => {
	const index = Find(array, target);
	if (index === -1) return undefined;
	return array.splice(index, 1);
};

export const Remove = <T>(array: T[], offset: number): T[] | undefined => {
	if (offset < 0 || offset >= array.length) return undefined;
	return array.splice(offset, 1);
};

export const Convert = <T>(array: ArrayLike<T> | Iterable<T>): T[] => Array.from(array);