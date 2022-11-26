import { IHSV } from './Type';

const HSV = () => {
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