import { IsString } from './Type';

const regCapital: RegExp = /[A-Z]/g;

export const IsEmpty: (value: unknown) => boolean = (value) => IsString(value) && value.length === 0;

export const LowerCase = (value: string): string => value.toLowerCase();
export const UpperCase = (value: string): string => value.toUpperCase();
export const Contains = (value: string, compare: string | RegExp) =>
	IsString(compare) ? value.includes(compare) : compare.test(value);

export const CapitalToDash = (value: string): string => {
	if (!IsString(value) || IsEmpty(value) || !regCapital.test(value)) return value;

	return value.split('').reduce((prev: string, cur: string): string => prev + (regCapital.test(cur) ? `-${LowerCase(cur)}` : cur));
};

export const DashToCapital = (value: string): string => {
	if (!IsString(value) || IsEmpty(value) || !Contains(value, '-')) return value;

	return value.trim().replace(regCapital, (str) => value.startsWith(str) ? LowerCase(str) : `-${LowerCase(str)}`);
};

export const Padding = (value: number | string, length: number = 2, pad: number | string = '0') =>
	value.toString().padStart(length, pad.toString());

export const Join = (attacher: string, ...args: string[]) => args.join(attacher);
export const Merge = (...args: string[]) => Join('', ...args);