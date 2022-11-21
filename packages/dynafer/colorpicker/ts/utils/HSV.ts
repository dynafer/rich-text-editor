import { IHSV } from './Type';

const HSV = () => {
	const ToMap = (...hsv: number[]): IHSV => ({
		hue: hsv[0],
		saturation: hsv[1],
		value: hsv[2],
	});

	return {
		ToMap,
	};
};

export default HSV();