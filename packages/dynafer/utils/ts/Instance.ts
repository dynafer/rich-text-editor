import { IsObject  } from './Type';
export interface IClassConstructor<T> {
	new (...params: ConstructorParameters<T extends abstract new (...args: IArguments[]) => T ? never : never>): T;
	prototype: T;
}

const isInstanceOf = <T>(instance: IClassConstructor<T>) => (value: unknown): value is T => value instanceof instance;

export const IsElement: (value: unknown) => value is Element = isInstanceOf(Element);
export const IsNode: (value: unknown) => value is Node = isInstanceOf(Node);

export const Is = <T>(value: unknown, instance: IClassConstructor<T>): value is T =>
	IsObject(value) && value instanceof instance;
