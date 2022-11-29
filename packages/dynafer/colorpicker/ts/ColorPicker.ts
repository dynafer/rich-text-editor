import { Insert } from '@dynafer/dom-control';
import { Sketcher } from '@dynafer/sketcher';
import Footer from './ui/Footer';
import Form from './ui/Form';
import { Hex, HSV, IHexUtils, IHSVUtils, IRGBAUtils, NAME, RGBA } from './utils/Utils';

export interface IColorPickerSetting {
	Icons: Record<string, string>,
	Pick: (rgb: string) => void,
}

export interface IColorPicker {
	Create: (setting: IColorPickerSetting) => void,
	Utils: {
		RGBA: IRGBAUtils,
		Hex: IHexUtils,
		HSV: IHSVUtils,
	},
}

const ColorPicker = (): IColorPicker => {
	const Create = (setting: IColorPickerSetting) => {
		const form = Form();
		if (!form) return;

		const schema = Sketcher.Modal(NAME, {
			Title: 'Color Picker',
			Icons: setting.Icons,
			Body: form.Form,
			Footer: Footer(
				() => {
					schema.Schema.Destroy();
				},
				() => {
					const rgbString = form.Navigation.GetRGB(false) as string | null;
					if (!rgbString) return;

					setting.Pick(rgbString);
					schema.Schema.Destroy();
				}
			),
		});

		Insert.AfterInner(schema.Schema.GetBody(), schema.Schema.Self);
	};

	return {
		Create,
		Utils: {
			RGBA,
			Hex,
			HSV,
		}
	};
};

export default ColorPicker();