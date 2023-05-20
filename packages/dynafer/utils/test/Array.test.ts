import * as Arr from '../ts/Array';

const TestArray = () =>
	describe('@dynafer/utils/Array', () => {
		describe('IsEmpty', () => {
			it('should return true for empty arrays', () => expect(Arr.IsEmpty([])).toBe(true));
			it('should return false for non-empty arrays', () => expect(Arr.IsEmpty([1, 2, 3])).toBe(false));
		});

		describe('Each', () => {
			it('should call the callback for each item in the array', () => {
				const array = [1, 2, 3];
				const callback = jest.fn();
				Arr.Each(array, callback);
				expect(callback).toHaveBeenCalledTimes(array.length);
				expect(callback).toHaveBeenCalledWith(1, expect.any(Function));
				expect(callback).toHaveBeenCalledWith(2, expect.any(Function));
				expect(callback).toHaveBeenCalledWith(3, expect.any(Function));
			});

			it('should exit the loop if the exit function is called', () => {
				const array = [1, 2, 3];
				const callback = jest.fn((_, exit) => exit());
				Arr.Each(array, callback);
				expect(callback).toHaveBeenCalledTimes(1);
			});
		});

		describe('Contains', () => {
			it('should return true if the array contains the expected value', () => expect(Arr.Contains([1, 2, 3], 2)).toBe(true));
			it('should return false if the array does not contain the expected value', () => expect(Arr.Contains([1, 2, 3], 4)).toBe(false));
		});

		it('should add items to the end of the array with Push()', () => {
			const array = [1, 2, 3];
			const length = Arr.Push(array, 4, 5);
			expect(array).toEqual([1, 2, 3, 4, 5]);
			expect(length).toBe(5);
		});

		describe('Pop', () => {
			it('should remove and return the last item in the array', () => {
				const array = [1, 2, 3];
				const item = Arr.Pop(array);
				expect(array).toEqual([1, 2]);
				expect(item).toBe(3);
			});

			it('should return undefined if the array is empty', () => {
				const array: unknown[] = [];
				const item = Arr.Pop(array);
				expect(array).toEqual([]);
				expect(item).toBeUndefined();
			});
		});

		it('should add items to the beginning of the array with Unshift()', () => {
			const array = [1, 2, 3];
			const length = Arr.Unshift(array, 0, -1);
			expect(array).toEqual([0, -1, 1, 2, 3]);
			expect(length).toBe(5);
		});

		describe('Shift', () => {
			it('should remove and return the first item in the array', () => {
				const array = [1, 2, 3];
				const item = Arr.Shift(array);
				expect(array).toEqual([2, 3]);
				expect(item).toBe(1);
			});

			it('should return undefined if the array is empty', () => {
				const array: unknown[] = [];
				const item = Arr.Shift(array);
				expect(array).toEqual([]);
				expect(item).toBeUndefined();
			});
		});

		describe('WhileShift', () => {
			it('should call the callback for each item in the array until exit is called', () => {
				const array = [1, 2, 3];
				const callback = jest.fn((_, exit) => exit());
				Arr.WhileShift(array, callback);
				expect(callback).toHaveBeenCalledTimes(1);
			});

			it('should exit the loop if the exit function is called', () => {
				const array = [1, 2, 3];
				const callback = jest.fn((_, exit) => exit());
				Arr.WhileShift(array, callback);
				expect(callback).toHaveBeenCalledTimes(1);
			});
		});

		describe('MergeUnique', () => {
			it('should merge arrays and remove duplicates', () => {
				const merged = Arr.MergeUnique([1, 2, 3], [2, 3, 4], [3, 4, 5]);
				expect(merged).toEqual([1, 2, 3, 4, 5]);
			});

			it('should return an empty array if no arrays are provided', () => {
				const merged = Arr.MergeUnique();
				expect(merged).toEqual([]);
			});
		});

		describe('Merge', () => {
			it('should merge arrays without removing duplicates', () => {
				const merged = Arr.Merge([1, 2, 3], [2, 3, 4], [3, 4, 5]);
				expect(merged).toEqual([1, 2, 3, 2, 3, 4, 3, 4, 5]);
			});

			it('should return an empty array if no arrays are provided', () => {
				const merged = Arr.Merge();
				expect(merged).toEqual([]);
			});
		});

		describe('Reverse', () => {
			it('should reverse the order of the items in the array', () => {
				const reversed = Arr.Reverse([1, 2, 3]);
				expect(reversed).toEqual([3, 2, 1]);
			});

			it('should return an empty array if the input array is empty', () => {
				const reversed = Arr.Reverse([]);
				expect(reversed).toEqual([]);
			});
		});

		describe('CompareAndGetStartIndex', () => {
			it('should return the index of the first item in the small array that is also in the big array', () => {
				const bigArray = [1, 2, 3, 4, 5];
				const smallArray = [3, 4];
				const startIndex = Arr.CompareAndGetStartIndex(bigArray, smallArray);
				expect(startIndex).toBe(2);
			});

			it('should return -1 if the big array does not contain any of the items in the small array', () => {
				const bigArray = [1, 2, 3, 4, 5];
				const smallArray = [6, 7];
				const startIndex = Arr.CompareAndGetStartIndex(bigArray, smallArray);
				expect(startIndex).toBe(-1);
			});

			it('should return -1 if either array is empty', () => {
				const emptyArray: unknown[] = [];
				const smallArray = [1];
				const startIndex1 = Arr.CompareAndGetStartIndex(emptyArray, smallArray);
				expect(startIndex1).toBe(-1);
				const startIndex2 = Arr.CompareAndGetStartIndex([1, 2, 3], []);
				expect(startIndex2).toBe(-1);
			});
		});

		it('should remove all items from the array with Clean()', () => {
			const array = [1, 2, 3];
			Arr.Clean(array);
			expect(array).toEqual([]);
		});

		describe('Find', () => {
			it('should return the index of the target in the array if it exists', () => {
				const index = Arr.Find([1, 2, 3], 2);
				expect(index).toBe(1);
			});

			it('should return -1 if the target does not exist in the array', () => {
				const index = Arr.Find([1, 2, 3], 4);
				expect(index).toBe(-1);
			});
		});

		describe('Compare', () => {
			it('should return true if the arrays have the same items in the same order', () => {
				const result = Arr.Compare([1, 2, 3], [1, 2, 3]);
				expect(result).toBe(true);
			});

			it('should return false if the arrays have different lengths', () => {
				const result = Arr.Compare([1, 2, 3], [1, 2]);
				expect(result).toBe(false);
			});

			it('should return false if the arrays have different items', () => {
				const result = Arr.Compare([1, 2, 3], [1, 3, 2]);
				expect(result).toBe(false);
			});
		});

		describe('Part', () => {
			it('should return a portion of the array between the start and end indices', () => {
				const part = Arr.Part([1, 2, 3, 4, 5], 1, 4);
				expect(part).toEqual([2, 3, 4]);
			});

			it('should return an empty array if the start index is greater than or equal to the end index', () => {
				const part1 = Arr.Part([1, 2, 3], 1, 1);
				expect(part1).toEqual([]);
				const part2 = Arr.Part([1, 2, 3], 2, 1);
				expect(part2).toEqual([]);
			});
		});

		describe('FindAndRemove', () => {
			it('should remove the first occurrence of the target from the array and return the removed item', () => {
				const array = [1, 2, 3, 2];
				const result = Arr.FindAndRemove(array, 2);
				expect(array).toEqual([1, 3, 2]);
				expect(result).toEqual([2]);
			});

			it('should return undefined if the target is not found in the array', () => {
				const array = [1, 2, 3];
				const result = Arr.FindAndRemove(array, 4);
				expect(array).toEqual([1, 2, 3]);
				expect(result).toBeUndefined();
			});
		});

		describe('Remove', () => {
			it('should remove the item at the specified offset and return the removed item', () => {
				const array = [1, 2, 3];
				const result = Arr.Remove(array, 1);
				expect(array).toEqual([1, 3]);
				expect(result).toEqual([2]);
			});

			it('should return undefined if the offset is out of bounds', () => {
				const array = [1, 2, 3];
				const result = Arr.Remove(array, 3);
				expect(array).toEqual([1, 2, 3]);
				expect(result).toBeUndefined();
			});
		});

		describe('Convert', () => {
			it('should convert an array-like object to an array', () => {
				const array = Arr.Convert({ 0: 1, 1: 2, 2: 3, length: 3 });
				expect(array).toEqual([1, 2, 3]);
			});

			it('should convert an iterable object to an array', () => {
				const array = Arr.Convert(new Set([1, 2, 3]));
				expect(array).toEqual([1, 2, 3]);
			});
		});
	});

export default TestArray;