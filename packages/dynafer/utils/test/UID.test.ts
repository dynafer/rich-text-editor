import * as UID from '../ts/UID';

const TestUID = () =>
	describe('@dynafer/utils/UID', () => {
		describe('CreateUEID', () => {
			it('adds a number to the end of the given id', () => expect(UID.CreateUEID('foo', true)).toMatch(/^foo-\d+$/));

			it('does not add a number to the end of the given id if bAddNum is false', () => expect(UID.CreateUEID('foo', false)).toBe('foo'));

			it('increments the number for each subsequent call with the same id', () => {
				const firstId = UID.CreateUEID('bar');
				const secondId = UID.CreateUEID('bar');
				expect(firstId).not.toBe(secondId);
			});

			it('returns the same id each time if bAddNum is false', () => {
				const firstId = UID.CreateUEID('baz', false);
				const secondId = UID.CreateUEID('baz', false);
				expect(firstId).toBe(secondId);
			});
		});

		describe('CreateUUID', () => {
			it('generates a UUID string in the format xxxyxx-xxxx-xyxxxyxxx', () => {
				const uuidRegex = /^[\w]{6}-[\w]{4}-[\w]{9}$/;
				expect(UID.CreateUUID()).toMatch(uuidRegex);
			});
		});
	});
export default TestUID;