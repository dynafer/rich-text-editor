export const GCD = (num1: number, num2: number): number =>
	num2 === 0 ? num1 : GCD(num2, num1 % num2);

export const RoundDecimal = (num: number, decimal: number = 2): number =>
	Math.round(num * (10 ** decimal)) / (10 ** decimal);
