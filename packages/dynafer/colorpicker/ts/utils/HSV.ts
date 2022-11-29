import { IHSV } from './Type';

export interface IHSVUtils {
	ToMap: (...hsv: number[]) => IHSV;
}

const HSV = (): IHSVUtils => {
	const ToMap = (...hsv: number[]): IHSV => ({
		Hue: hsv[0],
		Saturation: hsv[1],
		Value: hsv[2],
	});

	return {
		ToMap,
	};
};

export default HSV();