import { IsString, IsEmpty } from './Type';

const regCapital: RegExp = /[A-Z]/g;

export const CapitalToDash = (value: string): string => {
	if (!IsString(value) || IsEmpty(value) || !regCapital.test(value)) return value;

	return value.split('').reduce((prev: string, cur: string): string => prev + (regCapital.test(cur) ? `-${cur.toLowerCase()}` : cur));
};

export const DashToCapital = (value: string): string => {
	if (!IsString(value) || IsEmpty(value) || !regCapital.test(value)) return value;

	return value.trim().replace(regCapital, (str) => value.at(0) === str ? str.toLowerCase() : `-${str.toLowerCase()}`);
};
