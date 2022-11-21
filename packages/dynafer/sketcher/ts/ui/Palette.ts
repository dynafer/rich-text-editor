import { Type } from '@dynafer/utils';
import { IDOMFactory } from '../dom/DOMFactory';
import { IUISchemaMap } from '../types/UISchema';
import { IUISettingMap } from '../types/UISetting';
import { GetLimitation } from '../utils/UIUtils';
import Sketcher from './Sketcher';

const Palette = (setting: IUISettingMap['Palette']): IUISchemaMap['Palette'] | undefined => {
	const { width, height, events } = setting;

	const schema = Sketcher.SketchOne({
		tagName: 'canvas',
		attributes: {
			width: width.toString(),
			height: height.toString(),
			draggable: 'false',
		},
		events,
	}) as IDOMFactory<HTMLCanvasElement>;

	const canvas = schema.Self;

	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) return;

	context.rect(0, 0, width, height);

	const CreateGradient = (x0: number, y0: number, x1: number, y1: number): CanvasGradient =>
		context.createLinearGradient(x0, y0, x1, y1);

	const ColorStop = (gradient: CanvasGradient, stops: [number, string][]) => {
		if (!Type.IsArray(stops)) return;
		for (const stop of stops) {
			if (!Type.IsArray(stop) || stop.length !== 2) continue;
			gradient.addColorStop(stop[0], stop[1]);
		}
	};

	const Fill = (style: string | CanvasGradient | CanvasPattern) => {
		context.fillStyle = style;
		context.fill();
	};

	const FillRect = (style: string | CanvasGradient | CanvasPattern) => {
		context.fillStyle = style;
		context.fillRect(0, 0, width, height);
	};

	const GetRGB = (x: number, y: number): [number, number, number] => {
		const coordX = GetLimitation(x, 0, width);
		const coordY = GetLimitation(y, 0, height);
		const data = context.getImageData(coordX === width ? coordX - 1 : coordX, coordY === height ? coordY - 1 : coordY, 1, 1).data;
		return [data[0], data[1], data[2]];
	};

	return {
		Schema: schema,
		Self: schema,
		CreateGradient,
		ColorStop,
		Fill,
		FillRect,
		GetRGB,
	};
};

export default Palette;