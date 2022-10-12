const regCapital = /[A-Z]/g;

export const CapitalToDash = (value: string): string => {
	if (!regCapital.test(value)) return value;

	return value.split('').reduce((prev: string, cur: string): string => {
		return prev + (regCapital.test(cur) ? `-${cur.toLowerCase()}` : cur);
	});
};