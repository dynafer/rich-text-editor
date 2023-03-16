import { Arr, Type } from '@dynafer/utils';
import { IDOMFactory } from '../dom/DOMFactory';
import { IUISchemaMap } from '../types/UISchema';
import { IUISettingMap } from '../types/UISetting';
import { GetLimitation } from '../utils/UIUtils';
import Sketcher from './Sketcher';

const Palette = (setting: IUISettingMap['Palette']): IUISchemaMap['Palette'] | undefined => {
	const { Width, Height, Events } = setting;

	const schema = Sketcher.SketchOne({
		TagName: 'canvas',
		Attributes: {
			width: Width.toString(),
			height: Height.toString(),
			draggable: 'false',
		},
		Events,
	}) as IDOMFactory<HTMLCanvasElement>;

	const canvas = schema.Self;

	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) return;

	context.rect(0, 0, Width, Height);

	const CreateGradient = (x0: number, y0: number, x1: number, y1: number): CanvasGradient =>
		context.createLinearGradient(x0, y0, x1, y1);

	const ColorStop = (gradient: CanvasGradient, stops: [number, string][]) => {
		if (!Type.IsArray(stops)) return;
		Arr.Each(stops, stop => {
			if (!Type.IsArray(stop) || stop.length !== 2) return;
			gradient.addColorStop(stop[0], stop[1]);
		});
	};

	const Fill = (style: string | CanvasGradient | CanvasPattern) => {
		context.fillStyle = style;
		context.fill();
	};

	const FillRect = (style: string | CanvasGradient | CanvasPattern) => {
		context.fillStyle = style;
		context.fillRect(0, 0, Width, Height);
	};

	const GetRGB = (x: number, y: number): [number, number, number] => {
		const coordX = GetLimitation(x, 0, Width);
		const coordY = GetLimitation(y, 0, Height);
		const data = context.getImageData(coordX === Width ? coordX - 1 : coordX, coordY === Height ? coordY - 1 : coordY, 1, 1).data;
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