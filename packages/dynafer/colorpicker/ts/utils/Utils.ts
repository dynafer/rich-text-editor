import { Str } from '@dynafer/utils';
import Hex from './Hex';
import HSV from './HSV';
import RGBA from './RGBA';
import { IHSV, IRGBA } from './Type';

export const NAME = 'colorpicker';

export const CreateName = (...args: string[]) => Str.Join('-', NAME, ...args);

export {
	IRGBA,
	IHSV,
	RGBA,
	Hex,
	HSV,
};