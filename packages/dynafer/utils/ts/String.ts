import { IsString } from './Type';

const regCapital: RegExp = /[A-Z]/g;

export const IsEmpty: (value: unknown) => boolean = (value) => IsString(value) && value.length === 0;

export const LowerCase = (value: string): string => value.toLowerCase();
export const UpperCase = (value: string): string => value.toUpperCase();
export const Contains = (value: string, compare: string | RegExp) =>
	IsString(compare) ? value.includes(compare) : compare.test(value);

export const Padding = (value: number | string, length: number = 2, pad: number | string = '0') =>
	value.toString().padStart(length, pad.toString());

export const Join = (attacher: string, ...args: string[]) => args.join(attacher);
export const Merge = (...args: string[]) => Join('', ...args);

export const CapitaliseFirst = (value: string): string =>
	!IsString(value) || IsEmpty(value) ? '' : Merge(UpperCase(value.slice(0, 1)), value.slice(1, value.length));

const capitalTo = (to: string, value: string): string =>
	value.trim().split('').reduce((prev: string, cur: string): string => Merge(prev, regCapital.test(cur) ? Merge(to, LowerCase(cur)) : cur));

const toCapital = (from: string, value: string): string =>
	value.trim().split(from).reduce((prev: string, cur: string) => Merge(prev, CapitaliseFirst(cur)));

export const CapitalToDash = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !regCapital.test(value) ? value : capitalTo('-', value);
export const DashToCapital = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !Contains(value, '-') ? value : toCapital('-', value);

export const CapitalToUnderline = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !regCapital.test(value) ? value : capitalTo('_', value);
export const UnderlineToCapital = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !Contains(value, '_') ? value : toCapital('_', value);

export const CapitalToSpace = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !regCapital.test(value) ? value : capitalTo(' ', value);
export const SpaceToCapital = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !Contains(value, ' ') ? value : toCapital(' ', value);
