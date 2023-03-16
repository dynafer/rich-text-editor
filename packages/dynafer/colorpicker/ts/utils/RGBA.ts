import { Arr, Str } from '@dynafer/utils';
import Hex from './Hex';
import HSV from './HSV';
import { IHSV, IRGBA } from './Type';

export interface IRGBAUtils {
	ToMap: (...rgba: number[]) => IRGBA,
	ToRGB: (...rgba: number[]) => string,
	ToString: (rgba: IRGBA) => string,
	ArrayToString: (...rgba: number[]) => string,
	ToHex: (rgb: IRGBA, bWithSharp?: boolean) => string,
	ToHSV: (rgb: IRGBA) => IHSV,
	FromHexToMap: (hex: string) => IRGBA | null,
	FromString: (rgba: string) => number[],
}

const RGBA = (): IRGBAUtils => {
	const ToMap = (...rgba: number[]): IRGBA => ({
		Red: rgba[0],
		Green: rgba[1],
		Blue: rgba[2],
		Alpha: rgba[3] ?? 1,
	});

	const ToRGB = (...rgba: number[]): string => `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`;

	const ToString = (rgba: IRGBA): string => `rgba(${rgba.Red}, ${rgba.Green}, ${rgba.Blue}, ${rgba.Alpha})`;

	const ArrayToString = (...rgba: number[]): string => `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] ?? 1})`;

	const ToHex = (rgb: IRGBA, bWithSharp: boolean = true): string =>
		Str.Merge(
			bWithSharp ? '#' : '',
			Str.Padding(rgb.Red.toString(16)),
			Str.Padding(rgb.Green.toString(16)),
			Str.Padding(rgb.Blue.toString(16))
		);

	const ToHSV = (rgb: IRGBA): IHSV => {
		const r = rgb.Red / 255;
		const g = rgb.Green / 255;
		const b = rgb.Blue / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);

		if (min === max) return HSV.ToMap(0, 0, min * 100);

		const d = r === min
			? g - b
			: (b === min ? r - g : b - r);
		const h = 60 * (
			(r === min
				? 3
				: (b === min ? 1 : 5)
			) - d / (max - min));
		const s = (max - min) / max;
		const v = max;

		return HSV.ToMap(Math.round(h), Math.round(s * 100), Math.round(v * 100));
	};

	const FromHexToMap = (hex: string): IRGBA | null => {
		if (Str.IsEmpty(hex) || !Hex.IsValid(hex)) return null;
		const hexString = hex.replace('#', '');
		if (hexString.length === 6) {
			return {
				Red: parseInt(hexString.slice(0, 2), 16),
				Green: parseInt(hexString.slice(2, 4), 16),
				Blue: parseInt(hexString.slice(4, 6), 16),
				Alpha: 1
			};
		}

		const firstCode = hexString.slice(0, 1);
		const secondCode = hexString.slice(1, 2);
		const thirdCode = hexString.slice(2, 3);

		return {
			Red: parseInt(firstCode + firstCode, 16),
			Green: parseInt(secondCode + secondCode, 16),
			Blue: parseInt(thirdCode + thirdCode, 16),
			Alpha: 1
		};
	};

	const mapToArray = (rgba: IRGBA): number[] => [rgba.Red, rgba.Green, rgba.Blue, rgba.Alpha ?? 1];

	const FromString = (str: string): number[] => {
		let type: string;
		if (str.includes('#')) {
			type = 'hex';
		} else if (str.includes('rgb')) {
			type = 'rgba';
		} else {
			return [];
		}

		switch (type) {
			case 'hex':
				const converted = FromHexToMap(str);
				if (!converted) return [];
				return mapToArray(converted);
			case 'rgba':
				const array = str.replace(/[^\d,]/gi, '').split(',');
				const result: number[] = [];
				Arr.Each(array, part => Arr.Push(result, parseInt(part)));

				if (result.length <= 3) Arr.Push(result, 1);
				return result;
			default:
				return [];
		}
	};

	return {
		ToMap,
		ToRGB,
		ToString,
		ArrayToString,
		ToHex,
		ToHSV,
		FromHexToMap,
		FromString,
	};
};

export default RGBA();
