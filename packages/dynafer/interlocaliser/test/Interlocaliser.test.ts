import Interlocaliser from '../ts/Interlocaliser';

const TestInterlocaliser = () =>
	describe('@dynafer/interlocaliser/Interlocaliser', () => {
		it('should have a list of language codes', () => {
			expect(Interlocaliser.LANGUAGE_CODES).toBeDefined();
			expect(Interlocaliser.LANGUAGE_CODES['en-GB']).toBe('English (UK)');
			expect(Interlocaliser.LANGUAGE_CODES['ko']).toBe('Korean');
		});

		it('should have a list of languages', () => {
			expect(Interlocaliser.LANGUAGES).toBeDefined();
			expect(Interlocaliser.LANGUAGES['ENGLISH_UK']).toBe('en-GB');
			expect(Interlocaliser.LANGUAGES['KOREAN']).toBe('ko');
		});

		it('should be able to register a new language', () => {
			const map = {
				greeting: 'Hello, world!',
				farewell: 'Goodbye, world!',
			};
			Interlocaliser.Register('test', map);
			const value = Interlocaliser.Get('test', 'greeting');
			expect(value).toBe('Hello, world!');
		});

		it('should be able to get a string for a given language and key', () => {
			const map = {
				greeting: 'Hello, world!',
				farewell: 'Goodbye, world!',
			};
			Interlocaliser.Register('test', map);
			const value = Interlocaliser.Get('test', 'farewell');
			expect(value).toBe('Goodbye, world!');
		});

		it('should return null when getting an unknown key', () => {
			const value = Interlocaliser.Get('en', 'unknown');
			expect(value).toBeNull();
		});
	});

export default TestInterlocaliser;