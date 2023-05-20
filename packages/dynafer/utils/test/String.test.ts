import * as Str from '../ts/String';

const TestString = () =>
	describe('@dynafer/utils/String', () => {
		describe('isEmpty', () => {
			it('returns true for empty strings', () => expect(Str.IsEmpty('')).toBe(true));
			it('returns false for non-empty strings', () => expect(Str.IsEmpty('hello')).toBe(false));
			it('returns false for non-string values', () => expect(Str.IsEmpty(123)).toBe(false));
		});

		describe('LowerCase', () => {
			it('converts uppercase letters to lowercase', () => expect(Str.LowerCase('HELLO')).toBe('hello'));
			it('leaves lowercase letters unchanged', () => expect(Str.LowerCase('hello')).toBe('hello'));
			it('converts numbers to lowercase', () => expect(Str.LowerCase(123)).toBe('123'));
		});

		describe('UpperCase', () => {
			it('converts lowercase letters to uppercase', () => expect(Str.UpperCase('hello')).toBe('HELLO'));
			it('leaves uppercase letters unchanged', () => expect(Str.UpperCase('HELLO')).toBe('HELLO'));
			it('converts numbers to uppercase', () => expect(Str.UpperCase(123)).toBe('123'));
		});

		describe('Contains', () => {
			it('returns true if a string contains another string', () => expect(Str.Contains('hello world', 'world')).toBe(true));
			it('returns false if a string does not contain another string', () => expect(Str.Contains('hello world', 'foo')).toBe(false));
			it('handles regular expressions', () => expect(Str.Contains('hello world', /WORLD/i)).toBe(true));
		});

		describe('Padding', () => {
			it('adds padding to a string', () => expect(Str.Padding('1', 3)).toBe('001'));
			it('does not add padding to a string that is already long enough', () => expect(Str.Padding('123', 2)).toBe('123'));
			it('can use a custom padding character', () => expect(Str.Padding('1', 3, '-')).toBe('--1'));
		});

		describe('Join', () => {
			it('joins an array of strings with a separator', () => expect(Str.Join(', ', 'foo', 'bar', 'baz')).toBe('foo, bar, baz'));
			it('can join an array of numbers', () => expect(Str.Join(',', 1, 2, 3)).toBe('1,2,3'));
		});

		describe('Merge', () => {
			it('merges a list of strings into a single string', () => expect(Str.Merge('foo', 'bar', 'baz')).toBe('foobarbaz'));
			it('can merge a list of numbers', () => expect(Str.Merge(1, 2, 3)).toBe('123'));
		});

		describe('CapitaliseFirst', () => {
			it('capitalises the first letter of a string', () => expect(Str.CapitaliseFirst('hello')).toBe('Hello'));
			it('returns an empty string if the input is empty', () => expect(Str.CapitaliseFirst('')).toBe(''));
			it('returns an empty string if the input is not a string', () => expect(Str.CapitaliseFirst(123)).toBe(''));
		});

		describe('CapitalToDash', () => {
			it('converts a camelCase string to kebab-case', () => expect(Str.CapitalToDash('helloWorld')).toBe('hello-world'));
			it('returns the input unchanged if it does not contain any capital letters', () => expect(Str.CapitalToDash('hello')).toBe('hello'));
			it('returns an empty string if the input is empty', () => expect(Str.CapitalToDash('')).toBe(''));
		});

		describe('DashToCapital', () => {
			it('converts a kebab-case string to camelCase', () => expect(Str.DashToCapital('hello-world')).toBe('helloWorld'));
			it('returns the input unchanged if it does not contain a dash', () => expect(Str.DashToCapital('hello')).toBe('hello'));
			it('returns an empty string if the input is empty', () => expect(Str.DashToCapital('')).toBe(''));
		});

		describe('CapitalToUnderline', () => {
			it('converts a camelCase string to snake_case', () => expect(Str.CapitalToUnderline('helloWorld')).toBe('hello_world'));
			it('returns the input unchanged if it does not contain any capital letters', () => expect(Str.CapitalToUnderline('hello')).toBe('hello'));
			it('returns an empty string if the input is empty', () => expect(Str.CapitalToUnderline('')).toBe(''));
		});

		describe('UnderlineToCapital', () => {
			it('converts a snake_case string to camelCase', () => expect(Str.UnderlineToCapital('hello_world')).toBe('helloWorld'));
			it('returns the input unchanged if it does not contain an underscore', () => expect(Str.UnderlineToCapital('hello')).toBe('hello'));
			it('returns an empty string if the input is empty', () => expect(Str.UnderlineToCapital('')).toBe(''));
		});

		describe('CapitalToSpace', () => {
			it('converts a camelCase string to spaced words', () => expect(Str.CapitalToSpace('helloWorld')).toBe('hello world'));
			it('returns the input unchanged if it does not contain any capital letters', () => expect(Str.CapitalToSpace('hello')).toBe('hello'));
			it('returns an empty string if the input is empty', () => expect(Str.CapitalToSpace('')).toBe(''));
		});

		describe('SpaceToCapital', () => {
			it('converts spaced words to camelCase', () => expect(Str.SpaceToCapital('hello world')).toBe('helloWorld'));
			it('returns the input unchanged if it does not contain a space', () => expect(Str.SpaceToCapital('hello')).toBe('hello'));
			it('returns an empty string if the input is empty', () => expect(Str.SpaceToCapital('')).toBe(''));
		});

		describe('Commaize', () => {
			it('adds commas to a number', () => expect(Str.Commaize(1000)).toBe('1,000'));
			it('handles decimal points', () => expect(Str.Commaize(1234.5678)).toBe('1,234.5678'));
			it('ignores non-numeric characters', () => expect(Str.Commaize('$1,000.00')).toBe('1,000.00'));
		});
	});

export default TestString;