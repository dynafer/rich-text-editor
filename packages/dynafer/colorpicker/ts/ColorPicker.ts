import { Insert } from '@dynafer/dom-control';
import { Sketcher } from '@dynafer/sketcher';
import Footer from './ui/Footer';
import Form from './ui/Form';
import { NAME } from './utils/Utils';

export interface IColorPickerSetting {
	icons: Record<string, string>,
	pick: (rgb: string) => void,
}

export interface IColorPicker {
	Create: (setting: IColorPickerSetting) => void,
}

const ColorPicker = (): IColorPicker => {
	const Create = (setting: IColorPickerSetting) => {
		const form = Form();
		if (!form) return;

		const schema = Sketcher.Modal(NAME, {
			title: 'Color Picker',
			icons: setting.icons,
			body: form.Form,
			footer: Footer(
				() => {
					schema.Schema.Destroy();
				},
				() => {
					const rgbString = form.Navigation.GetRGB(false) as string | null;
					if (!rgbString) return;

					setting.pick(rgbString);
					schema.Schema.Destroy();
				}
			),
		});

		Insert.AfterInner(schema.Schema.GetBody(), schema.Schema.Self);
	};

	return {
		Create
	};
};

export default ColorPicker();