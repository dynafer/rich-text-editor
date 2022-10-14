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

export const IsString: (value: unknown) => value is string = isType('string');
export const IsNumber: (value: unknown) => value is number = isType('number');
export const IsArray: (value: unknown) => value is Array<unknown> = isType('array');
export const IsObject: (value: unknown) => value is object = isType('object');