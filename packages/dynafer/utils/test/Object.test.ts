import * as Obj from '../ts/Object';

const TestObject = () =>
	describe('@dynafer/utils/Object', () => {
		describe('Entries', () => {
			it('should return an array of key-value pairs for an object', () => {
				const obj = { a: 1, b: 2, c: 3 };
				expect(Obj.Entries(obj)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
			});

			it('should call the callback function for each key-value pair', () => {
				const obj = { a: 1, b: 2, c: 3 };
				const callback = jest.fn();
				Obj.Entries(obj, callback);
				expect(callback).toHaveBeenCalledTimes(3);
				expect(callback).toHaveBeenCalledWith('a', 1, expect.any(Function));
				expect(callback).toHaveBeenCalledWith('b', 2, expect.any(Function));
				expect(callback).toHaveBeenCalledWith('c', 3, expect.any(Function));
			});

			it('should exit early if the exit function is called in the callback', () => {
				const obj = { a: 1, b: 2, c: 3 };
				const callback = jest.fn((key, value, exit) => {
					if (key === 'b') exit();
				});
				Obj.Entries(obj, callback);
				expect(callback).toHaveBeenCalledTimes(2);
			});

			it('should return an empty array if no callback is provided', () => {
				const obj = { a: 1, b: 2, c: 3 };
				expect(Obj.Entries(obj, undefined)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
			});
		});

		describe('Keys', () => {
			it('should return an array of keys for an object', () => {
				const obj = { a: 1, b: 2, c: 3 };
				expect(Obj.Keys(obj)).toEqual(['a', 'b', 'c']);
			});

			it('should call the callback function for each key', () => {
				const obj = { a: 1, b: 2, c: 3 };
				const callback = jest.fn();
				Obj.Keys(obj, callback);
				expect(callback).toHaveBeenCalledTimes(3);
				expect(callback).toHaveBeenCalledWith('a', expect.any(Function));
				expect(callback).toHaveBeenCalledWith('b', expect.any(Function));
				expect(callback).toHaveBeenCalledWith('c', expect.any(Function));
			});

			it('should exit early if the exit function is called in the callback', () => {
				const obj = { a: 1, b: 2, c: 3 };
				const callback = jest.fn((key, exit) => {
					if (key === 'b') exit();
				});
				Obj.Keys(obj, callback);
				expect(callback).toHaveBeenCalledTimes(2);
			});
		});

		describe('Values', () => {
			it('should return an array if no callback is provided', () => {
				const obj = { a: 1, b: 2, c: 3 };
				expect(Obj.Values(obj)).toEqual([1, 2, 3]);
			});

			it('should call the callback function for each value', () => {
				const obj = { a: 1, b: 2, c: 3 };
				const callback = jest.fn();
				Obj.Values(obj, callback);
				expect(callback).toHaveBeenCalledTimes(3);
				expect(callback).toHaveBeenCalledWith(1, expect.any(Function));
				expect(callback).toHaveBeenCalledWith(2, expect.any(Function));
				expect(callback).toHaveBeenCalledWith(3, expect.any(Function));
			});

			it('should exit early if the exit function is called in the callback', () => {
				const obj = { a: 1, b: 2, c: 3 };
				const callback = jest.fn((value, exit) => {
					if (value === 2) exit();
				});
				Obj.Values(obj, callback);
				expect(callback).toHaveBeenCalledTimes(2);
			});
		});

		describe('SetProperty', () => {
			it('should set the value of a property on an object', () => {
				const obj = { a: 1, b: 2 };
				Obj.SetProperty(obj, 'c', 3);
				expect(obj).toEqual({ a: 1, b: 2, c: 3 });
			});

			it('should do nothing if the input is not an object', () => {
				const obj = 123;
				Obj.SetProperty(obj, 'a', 1);
				expect(Obj.GetProperty(obj, 'a')).toBeUndefined();
			});
		});

		describe('GetProperty', () => {
			it('should return the value of a property on an object', () => {
				const obj = { a: 1, b: 2 };
				expect(Obj.GetProperty(obj, 'a')).toBe(1);
				expect(Obj.GetProperty(obj, 'b')).toBe(2);
			});

			it('should return undefined if the property does not exist', () => {
				const obj = { a: 1, b: 2 };
				expect(Obj.GetProperty(obj, 'c')).toBeUndefined();
			});

			it('should return undefined if the input is not an object', () => {
				const obj = 123;
				expect(Obj.GetProperty(obj, 'a')).toBeUndefined();
			});
		});

		describe('HasProperty', () => {
			it('should return true if an object has a property', () => {
				const obj = { a: 1, b: 2 };
				expect(Obj.HasProperty<typeof obj>(obj, 'a')).toBe(true);
				expect(Obj.HasProperty<typeof obj>(obj, 'b')).toBe(true);
			});

			it('should return false if an object does not have a property', () => {
				const obj = { a: 1, b: 2 };
				expect(Obj.HasProperty<typeof obj>(obj, 'c')).toBe(false);
			});

			it('should return false if the input is not an object', () => {
				const obj = 123;
				expect(Obj.HasProperty<typeof obj>(obj, 'a')).toBe(false);
			});
		});

	});

export default TestObject;