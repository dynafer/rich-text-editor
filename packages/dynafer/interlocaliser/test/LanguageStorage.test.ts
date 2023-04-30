import LanguageStorage from '../ts/LanguageStorage';

const TestLanguageStorage = () =>
	describe('@dynafer/interlocaliser/LanguageStorage', () => {
		// Clear the Languages before each test
		beforeEach(() => Object.keys(LanguageStorage.Languages).forEach((key) => delete LanguageStorage.Languages?.[key]));

		it('should add a key-value pair to the language map with Add()', () => {
			LanguageStorage.Add('en', 'greeting', 'Hello');
			expect(LanguageStorage.Languages).toEqual({ en: { greeting: 'Hello' } });
		});

		it('should add multiple key-value pairs to the language map with AddMap()', () => {
			const map = { greeting: 'Hello', farewell: 'Goodbye' };
			LanguageStorage.AddMap('en', map);
			expect(LanguageStorage.Languages).toEqual({ en: map });
		});

		it('should return the value for a given key in the language map with Get()', () => {
			LanguageStorage.Add('en', 'greeting', 'Hello');
			expect(LanguageStorage.Get('en', 'greeting')).toBe('Hello');
		});

		it('should return null if the key does not exist in the language map with Get()', () => expect(LanguageStorage.Get('en', 'greeting')).toBeNull());

		it('should remove a language from the language map with Remove()', () => {
			LanguageStorage.Add('en', 'greeting', 'Hello');
			LanguageStorage.Remove('en');
			expect(LanguageStorage.Languages).toEqual({});
		});
	});

export default TestLanguageStorage;