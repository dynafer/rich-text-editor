import { IsString } from './Type';

const REGEX_CAPITAL_LETTER: RegExp = /[A-Z]/g;
const REGEX_COMMAIZE_NUMBER: RegExp = /\B(?=(\d{3})+(?!\d))/g;

export const IsEmpty: (value: unknown) => boolean = (value) => IsString(value) && value.length === 0;

export const LowerCase = (value: string | number): string => value.toString().toLowerCase();
export const UpperCase = (value: string | number): string => value.toString().toUpperCase();
export const Contains = (value: string, expect: string | RegExp): boolean =>
	IsString(expect) ? value.includes(expect) : expect.test(value);

export const Padding = (value: string | number, length: number = 2, pad: string | number = '0'): string =>
	value.toString().padStart(length, pad.toString());

export const Join = (attacher: string, ...args: (string | number)[]): string => args.join(attacher);
export const Merge = (...args: (string | number)[]): string => Join('', ...args);

export const CapitaliseFirst = (value: unknown): string =>
	!IsString(value) || IsEmpty(value) ? '' : Merge(UpperCase(value.slice(0, 1)), value.slice(1, value.length));

const capitalTo = (to: string, value: string): string =>
	value.trim().split('').reduce((prev: string, cur: string): string => Merge(prev, REGEX_CAPITAL_LETTER.test(cur) ? Merge(to, LowerCase(cur)) : cur));

const toCapital = (from: string, value: string): string =>
	value.trim().split(from).reduce((prev: string, cur: string): string => Merge(prev, CapitaliseFirst(cur)));

export const CapitalToDash = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !REGEX_CAPITAL_LETTER.test(value) ? value : capitalTo('-', value);
export const DashToCapital = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !Contains(value, '-') ? value : toCapital('-', value);

export const CapitalToUnderline = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !REGEX_CAPITAL_LETTER.test(value) ? value : capitalTo('_', value);
export const UnderlineToCapital = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !Contains(value, '_') ? value : toCapital('_', value);

export const CapitalToSpace = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !REGEX_CAPITAL_LETTER.test(value) ? value : capitalTo(' ', value);
export const SpaceToCapital = (value: string): string =>
	!IsString(value) || IsEmpty(value) || !Contains(value, ' ') ? value : toCapital(' ', value);

export const Commaize = (value: string | number): string => {
	const newValue = value.toString().replace(/[^0-9.]/g, '');
	const splitedDecimalPoint = newValue.split('.');
	splitedDecimalPoint[0] = splitedDecimalPoint[0].replace(REGEX_COMMAIZE_NUMBER, ',');

	if (splitedDecimalPoint.length <= 2) return Join('.', ...splitedDecimalPoint);

	return Join('.', splitedDecimalPoint[0], Merge(...splitedDecimalPoint.slice(1, splitedDecimalPoint.length)));
};