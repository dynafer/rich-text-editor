import { Arr, Str, Type } from '@dynafer/utils';
import Hex from './Hex';
import HSV from './HSV';
import { IHSV, IRGBA } from './Type';

export interface IRGBAUtils {
	IsValid: (rgba: IRGBA) => boolean,
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
	const IsValid = (rgba: IRGBA): boolean => {
		if (!Type.IsNumber(rgba.Red) || !Type.IsNumber(rgba.Green) || !Type.IsNumber(rgba.Blue) || !Type.IsNumber(rgba.Alpha)) return false;
		if (
			(rgba.Red < 0 || rgba.Red > 255)
			|| (rgba.Green < 0 || rgba.Green > 255)
			|| (rgba.Blue < 0 || rgba.Blue > 255)
			|| (rgba.Alpha < 0 || rgba.Alpha > 1)
		) return false;

		return true;
	};

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
		const red = rgb.Red / 255;
		const green = rgb.Green / 255;
		const blue = rgb.Blue / 255;
		const min = Math.min(red, green, blue);
		const max = Math.max(red, green, blue);

		if (min === max) return HSV.ToMap(0, 0, min * 100);

		const degrees = red === min
			? green - blue
			: (blue === min ? red - green : blue - red);
		const hueDiff = red === min
			? 3
			: (blue === min ? 1 : 5);
		const hue = 60 * (hueDiff - degrees / (max - min));
		const saturation = (max - min) / max;
		const value = max;

		return HSV.ToMap(Math.round(hue), Math.round(saturation * 100), Math.round(value * 100));
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

	const getColorType = (str: string): string | null => {
		if (Str.Contains(str, '#')) return 'hex';
		if (Str.Contains(str, 'rgb')) return 'rgba';
		return null;
	};

	const FromString = (str: string): number[] => {
		const type = getColorType(str);
		if (!type) return [];

		switch (type) {
			case 'hex':
				const converted = FromHexToMap(str);
				return !converted ? [] : mapToArray(converted);
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
		IsValid,
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
