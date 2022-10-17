interface IClassConstructor<T> {
	new (): T;
	prototype: T;
}

const getType = (value: unknown = undefined): string => {
	const type: string = typeof value;
	switch (true) {
		case value === null:
			return 'null';
		case type === 'object' && Array.isArray(value):
			return 'array';
		default:
			return type;
	}
};

const isType = <T>(type: string) => (value: unknown): value is T => getType(value) === type;
const isInstance = <T>(type: IClassConstructor<T>) => (value: unknown): value is T => value instanceof type;

export const IsString: (value: unknown) => value is string = isType('string');
export const IsNumber: (value: unknown) => value is number = isType('number');
export const IsArray: (value: unknown) => value is Array<unknown> = isType('array');
export const IsObject: (value: unknown) => value is object = isType('object');

export const IsElement: (value: unknown) => value is Element = isInstance(Element);

export const IsEmpty: (value: unknown) => boolean = (value) => IsString(value) && value.length === 0;