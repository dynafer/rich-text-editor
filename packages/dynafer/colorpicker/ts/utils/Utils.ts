import { Str } from '@dynafer/utils';
import Hex, { IHexUtils } from './Hex';
import HSV, { IHSVUtils } from './HSV';
import RGBA, { IRGBAUtils } from './RGBA';
import { IHSV, IRGBA } from './Type';

export const NAME = 'colorpicker';

export const CreateName = (...args: string[]): string => Str.Join('-', NAME, ...args);

export {
	IRGBA,
	IHSV,
	IRGBAUtils,
	IHexUtils,
	IHSVUtils,
	RGBA,
	Hex,
	HSV,
};