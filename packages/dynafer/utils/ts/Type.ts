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

export const IsArray: (value: unknown) => value is unknown[] = isType('array');
export const IsNumber: (value: unknown) => value is number = isType('number');
export const IsObject: (value: unknown) => value is object = isType('object');
export const IsString: (value: unknown) => value is string = isType('string');
export const IsBoolean: (value: unknown) => value is boolean = isType('boolean');
export const IsFunction: (value: unknown) => value is (...params: unknown[]) => void = isType('function');
export const IsNull: (value: unknown) => value is null = isType('null');
export const IsUndefined: (value: unknown) => value is undefined = isType('undefined');