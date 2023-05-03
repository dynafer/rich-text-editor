import { Style } from '@dynafer/dom-control';
import { DOMFactory, Schema, Sketcher } from '@dynafer/sketcher';
import { Arr, Obj, Str } from '@dynafer/utils';
import { CreateName, IRGBA, RGBA } from '../utils/Utils';
import { IHue } from './Hue';
import { IPalette } from './Palette';

export interface INavigation extends DOMFactory<HTMLInputElement> {
	GetRGB: <T extends boolean>(bArray: T) => T extends true ? number[] : (string | null),
	UpdateRGB: (rgb: IRGBA) => void,
}

const Navigation = (palette: IPalette, hue: IHue): INavigation => {
	const inputs: Schema.IInputSchema[] = [];
	const elements: DOMFactory[] = [];
	Arr.Each(['R', 'G', 'B', '#'], Label => {
		const input = Sketcher.Input({ Label });
		Arr.Push(inputs, input);
		Arr.Push(elements, input.Schema);
	});

	const schema = Sketcher.SketchOne({
		TagName: CreateName('navigation'),
		Elements: [
			...elements,
			{ TagName: 'div' }
		]
	}) as INavigation;

	const rgbElements = {
		Red: inputs[0],
		Green: inputs[1],
		Blue: inputs[2]
	};

	const hex = inputs[3];

	const presentation = schema.GetChildren()[4];

	schema.UpdateRGB = (rgb: IRGBA) => {
		if (!RGBA.IsValid(rgb)) return;

		Obj.Entries(rgbElements, (key, inputSchema) => inputSchema.SetValue(rgb[key as 'Red'].toString()));

		hex.SetValue(RGBA.ToHex(rgb, false));
		Style.Set(presentation.Self, 'background-color', RGBA.ToString(rgb));
	};

	const toggleError = (inputSchema: Schema.IUISchemaMap['Input'], bError: boolean) => {
		const className = 'error';
		return bError ? inputSchema.Self.AddClass(className) : inputSchema.Self.RemoveClass(className);
	};

	schema.GetRGB = <T extends boolean>(bArray: T): T extends true ? number[] : (string | null) => {
		const rgb: number[] = [];
		Obj.Values(rgbElements, inputSchema => {
			if (Str.IsEmpty(inputSchema.GetValue())) {
				toggleError(inputSchema, true);
				return null;
			}
			const value = parseInt(inputSchema.GetValue());
			if (value < 0 || value > 255) {
				toggleError(inputSchema, true);
				return null;
			}
			Arr.Push(rgb, value);
			toggleError(inputSchema, false);
		});

		return (bArray ? rgb : RGBA.ToRGB(...rgb)) as T extends true ? number[] : (string | null);
	};

	const rgbKeyEvent = () => {
		const rgb = schema.GetRGB(true) as number[] | null;
		if (!rgb) return;

		const rgba = RGBA.ToMap(...rgb);

		palette.UpdateGuide(rgba);
		hue.UpdateGuide(rgba);
		schema.UpdateRGB(rgba);
		toggleError(hex, false);
	};

	const hexKeyEvent = () => {
		const convertedRGB = RGBA.FromHexToMap(hex.GetValue());
		if (!convertedRGB) return toggleError(hex, true);

		palette.UpdateGuide(convertedRGB);
		hue.UpdateGuide(convertedRGB);
		schema.UpdateRGB(convertedRGB);
		toggleError(hex, false);
	};

	Obj.Values(rgbElements, inputSchema => {
		inputSchema.Self.Bind('keydown', rgbKeyEvent);
		inputSchema.Self.Bind('keyup', rgbKeyEvent);
	});

	hex.Self.Bind('keydown', hexKeyEvent);
	hex.Self.Bind('keyup', hexKeyEvent);

	return schema;
};

export default Navigation;