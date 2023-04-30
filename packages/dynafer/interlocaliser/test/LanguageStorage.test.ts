import LanguageStorage from '../ts/LanguageStorage';

const TestLanguageStorage = () =>
	describe('@dynafer/interlocaliser/LanguageStorage', () => {
		// Clear the Languages before each test
		beforeEach(() => Object.keys(LanguageStorage.Languages).forEach((key) => delete LanguageStorage.Languages?.[key]));

		test('Add() should add a key-value pair to the language map', () => {
			LanguageStorage.Add('en', 'greeting', 'Hello');
			expect(LanguageStorage.Languages).toEqual({ en: { greeting: 'Hello' } });
		});

		test('AddMap() should add multiple key-value pairs to the language map', () => {
			const map = { greeting: 'Hello', farewell: 'Goodbye' };
			LanguageStorage.AddMap('en', map);
			expect(LanguageStorage.Languages).toEqual({ en: map });
		});

		test('Get() should return the value for a given key in the language map', () => {
			LanguageStorage.Add('en', 'greeting', 'Hello');
			expect(LanguageStorage.Get('en', 'greeting')).toBe('Hello');
		});

		test('Get() should return null if the key does not exist in the language map', () => {
			expect(LanguageStorage.Get('en', 'greeting')).toBeNull();
		});

		test('Remove() should remove a language from the language map', () => {
			LanguageStorage.Add('en', 'greeting', 'Hello');
			LanguageStorage.Remove('en');
			expect(LanguageStorage.Languages).toEqual({});
		});
	});

export default TestLanguageStorage;