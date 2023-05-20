import * as Type from '../ts/Type';

const TestType = () =>
	describe('@dynafer/utils/Type', () => {
		describe('IsArray', () => {
			it('returns true for array values', () => expect(Type.IsArray([1, 2, 3])).toBe(true));
			it('returns false for non-array values', () => expect(Type.IsArray('hello')).toBe(false));
		});

		describe('IsNumber', () => {
			it('returns true for number values', () => expect(Type.IsNumber(123)).toBe(true));
			it('returns false for non-number values', () => expect(Type.IsNumber('hello')).toBe(false));
		});

		describe('IsObject', () => {
			it('returns true for object values', () => expect(Type.IsObject({ foo: 'bar' })).toBe(true));
			it('returns false for non-object values', () => expect(Type.IsObject('hello')).toBe(false));
		});

		describe('IsString', () => {
			it('returns true for string values', () => expect(Type.IsString('hello')).toBe(true));
			it('returns false for non-string values', () => expect(Type.IsString(123)).toBe(false));
		});

		describe('IsBoolean', () => {
			it('returns true for boolean values', () => expect(Type.IsBoolean(true)).toBe(true));
			it('returns false for non-boolean values', () => expect(Type.IsBoolean(123)).toBe(false));
		});

		describe('IsFunction', () => {
			it('returns true for function values', () => expect(Type.IsFunction(() => { })).toBe(true));
			it('returns false for non-function values', () => expect(Type.IsFunction(123)).toBe(false));
		});

		describe('IsNull', () => {
			it('returns true for null values', () => expect(Type.IsNull(null)).toBe(true));
			it('returns false for non-null values', () => expect(Type.IsNull(undefined)).toBe(false));
		});

		describe('IsUndefined', () => {
			it('returns true for undefined values', () => expect(Type.IsUndefined(undefined)).toBe(true));
			it('returns false for non-undefined values', () => expect(Type.IsUndefined(null)).toBe(false));
		});
	});

export default TestType;