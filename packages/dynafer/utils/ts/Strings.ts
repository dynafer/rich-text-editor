import { IsEmpty } from './Type';

export const CapitalToDash = (value: string): string => {
	if (IsEmpty(value)) return value;

	const regCapital: RegExp = /[A-Z]/g;
	if (!regCapital.test(value)) return value;

	return value.split('').reduce((prev: string, cur: string): string => {
		return prev + (regCapital.test(cur) ? `-${cur.toLowerCase()}` : cur);
	});
};

