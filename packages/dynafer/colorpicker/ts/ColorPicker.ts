import { Inserter } from '@dynafer/dom-control';
import { Sketcher } from '@dynafer/sketcher';
import Footer from './ui/Footer';
import Form from './ui/Form';
import { Hex, HSV, IHexUtils, IHSVUtils, IRGBAUtils, NAME, RGBA } from './utils/Utils';

export interface IColorPickerSetting {
	readonly Icons: Record<string, string>,
	readonly Texts: Record<string, string>,
	Pick: (rgb: string) => void,
}

export interface IColorPicker {
	Create: (setting: IColorPickerSetting) => void,
	readonly Utils: {
		readonly RGBA: IRGBAUtils,
		readonly Hex: IHexUtils,
		readonly HSV: IHSVUtils,
	},
}

const ColorPicker = (): IColorPicker => {
	const Create = (setting: IColorPickerSetting) => {
		const form = Form();
		if (!form) return;

		const schema = Sketcher.Modal(NAME, {
			Title: setting.Texts.Title,
			Icons: setting.Icons,
			Body: form.Form,
			Footer: Footer(
				setting.Icons,
				setting.Texts,
				() => schema.Schema.Destroy(),
				() => {
					const rgbString = form.Navigation.GetRGB(false);
					if (!rgbString) return;

					setting.Pick(rgbString);
					schema.Schema.Destroy();
				}
			),
		});

		Inserter.AfterInner(document, schema.Schema.GetBody(), schema.Schema.Self);
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