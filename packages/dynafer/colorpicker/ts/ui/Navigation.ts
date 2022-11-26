import { Style } from '@dynafer/dom-control';
import { IDOMFactory, Schema, Sketcher } from '@dynafer/sketcher';
import { Str } from '@dynafer/utils';
import { RGBA, IRGBA, CreateName } from '../utils/Utils';
import { IPalette } from './Palette';
import { IHue } from './Hue';

export interface INavigation extends IDOMFactory {
	GetRGB: (bArray: boolean) => string | number[] | null,
	UpdateRGB: (rgb: IRGBA) => void,
}

const Navigation = (palette: IPalette, hue: IHue): INavigation => {
	const inputs = [];
	const elements = [];
	for (const Label of ['R', 'G', 'B', '#']) {
		const input = Sketcher.Input({ Label });
		inputs.push(input);
		elements.push(input.Schema);
	}

	const schema = Sketcher.SketchOne({
		TagName: CreateName('navigation'),
		Elements: [
			...elements,
			{
				TagName: 'div'
			}
		]
	});

	const rgbElements = {
		Red: inputs[0],
		Green: inputs[1],
		Blue: inputs[2]
	};

	const hex = inputs[3];

	const presentation = schema.GetChildren()[4];

	const UpdateRGB = (rgb: IRGBA) => {
		for (const [key, inputSchema] of Object.entries(rgbElements)) {
			inputSchema.SetValue(rgb[key].toString());
		}

		hex.SetValue(RGBA.ToHex(rgb, false));
		Style.Set(presentation.Self, 'background-color', RGBA.ToString(rgb));
	};

	const toggleError = (inputSchema: Schema.IUISchemaMap['Input'], bError: boolean) => {
		const toggle = bError ? inputSchema.Self.AddClass : inputSchema.Self.RemoveClass;
		toggle('error');
	};

	const GetRGB = (bArray: boolean): string | number[] | null => {
		const rgb = [];
		for (const inputSchema of Object.values(rgbElements)) {
			if (Str.IsEmpty(inputSchema.GetValue())) {
				toggleError(inputSchema, true);
				return null;
			}
			const value = parseInt(inputSchema.GetValue());
			if (value < 0 || value > 255) {
				toggleError(inputSchema, true);
				return null;
			}
			rgb.push(value);
			toggleError(inputSchema, false);
		}

		return bArray ? rgb : RGBA.ToRGB(...rgb);
	};

	const rgbKeyEvent = () => {
		const rgb = GetRGB(true) as number[] | null;
		if (!rgb) return;

		const rgba = RGBA.ToMap(...rgb);

		palette.UpdateGuide(rgba);
		hue.UpdateGuide(rgba);
		UpdateRGB(rgba);
		toggleError(hex, false);
	};

	const hexKeyEvent = () => {
		const convertedRGB = RGBA.FromHex(hex.GetValue());
		if (!convertedRGB) return toggleError(hex, true);

		palette.UpdateGuide(convertedRGB);
		hue.UpdateGuide(convertedRGB);
		UpdateRGB(convertedRGB);
		toggleError(hex, false);
	};

	for (const inputSchema of Object.values(rgbElements)) {
		inputSchema.Self.Bind('keydown', rgbKeyEvent);
		inputSchema.Self.Bind('keyup', rgbKeyEvent);
	}

	hex.Self.Bind('keydown', hexKeyEvent);
	hex.Self.Bind('keyup', hexKeyEvent);

	return {
		...schema,
		GetRGB,
		UpdateRGB,
	};
};

export default Navigation;