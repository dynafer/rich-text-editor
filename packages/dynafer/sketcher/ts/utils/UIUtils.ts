import { Str } from '@dynafer/utils';

export const CreateTagName = (...args: string[]): string => Str.Join('-', ...args);

export const GetLimitation = (coord: number, min: number, max: number): number =>
	coord <= min ? min : (coord >= max ? max : coord);