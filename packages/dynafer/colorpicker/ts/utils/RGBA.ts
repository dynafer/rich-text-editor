import { Str } from '@dynafer/utils';
import Hex from './Hex';
import HSV from './HSV';
import { IHSV, IRGBA } from './Type';

const RGBA = () => {
	const ToMap = (...rgba: number[]): IRGBA => ({
		red: rgba[0],
		green: rgba[1],
		blue: rgba[2],
		alpha: rgba[3] ?? 1,
	});

	const ToRGB = (...rgba: number[]) => `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`;

	const ToString = (rgba: IRGBA): string => `rgba(${rgba.red}, ${rgba.green}, ${rgba.blue}, ${rgba.alpha})`;

	const ArrayToString = (...rgba: number[]): string => `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] ?? 1})`;

	const ToHex = (rgb: IRGBA, bWithSharp: boolean = true): string =>
		Str.Join('',
			bWithSharp ? '#' : '',
			Str.Padding(rgb.red.toString(16)),
			Str.Padding(rgb.green.toString(16)),
			Str.Padding(rgb.blue.toString(16))
		);

	const ToHSV = (rgb: IRGBA): IHSV => {
		const r = rgb.red / 255;
		const g = rgb.green / 255;
		const b = rgb.blue / 255;
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

	const FromHex = (hex: string): IRGBA | null =>
		Str.IsEmpty(hex) || !Hex.IsValid(hex)
			? null
			: {
				red: parseInt(hex.slice(0, 2), 16),
				green: parseInt(hex.slice(2, 4), 16),
				blue: parseInt(hex.slice(4, 6), 16),
				alpha: 1
			};

	return {
		ToMap,
		ToRGB,
		ToString,
		ArrayToString,
		ToHex,
		ToHSV,
		FromHex,
	};
};

export default RGBA();
