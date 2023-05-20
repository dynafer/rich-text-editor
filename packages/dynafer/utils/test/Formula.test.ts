import * as Formula from '../ts/Formula';

const TestFormula = () =>
	describe('@dynafer/utils/Formula', () => {
		describe('GCD', () => {
			it('should return the greatest common divisor of two numbers', () => {
				expect(Formula.GCD(54, 24)).toBe(6);
				expect(Formula.GCD(84, 18)).toBe(6);
				expect(Formula.GCD(1024, 256)).toBe(256);
			});

			it('should return the input number if one of the inputs is zero', () => {
				expect(Formula.GCD(1, 0)).toBe(1);
				expect(Formula.GCD(0, 1)).toBe(1);
				expect(Formula.GCD(0, 0)).toBe(0);
			});
		});

		describe('RoundDecimal', () => {
			it('should round a number to a specified number of decimal places', () => {
				expect(Formula.RoundDecimal(1.234, 2)).toBe(1.23);
				expect(Formula.RoundDecimal(1.239, 2)).toBe(1.24);
				expect(Formula.RoundDecimal(1.0, 2)).toBe(1.0);
			});

			it('should default to rounding to two decimal places', () => {
				expect(Formula.RoundDecimal(1.234)).toBe(1.23);
				expect(Formula.RoundDecimal(1.239)).toBe(1.24);
				expect(Formula.RoundDecimal(1.0)).toBe(1.0);
			});
		});

		it('should calculate the percentage of one number compared to another with Percent()', () => {
			expect(Formula.Percent(50, 100)).toBe(50);
			expect(Formula.Percent(75, 150)).toBe(50);
			expect(Formula.Percent(1, 3)).toBeCloseTo(33.33, 2);
		});

		it('should calculate the value of a percentage compared to a base number with RevertPercent()', () => {
			expect(Formula.RevertPercent(50, 100)).toBe(50);
			expect(Formula.RevertPercent(50, 150)).toBe(75);
			expect(Formula.RevertPercent(33.33, 3)).toBeCloseTo(1, 2);
		});
	});

export default TestFormula;