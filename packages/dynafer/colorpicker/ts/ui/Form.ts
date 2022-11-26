import { IDOMFactory, Sketcher } from '@dynafer/sketcher';
import { RGBA, CreateName } from '../utils/Utils';
import Hue from './Hue';
import Navigation, { INavigation } from './Navigation';
import Palette, { IPalette } from './Palette';

export interface IColorPickerForm {
	Form: IDOMFactory,
	Navigation: INavigation,
}

const Form = (): IColorPickerForm | undefined => {
	const form = Sketcher.SketchOne({
		TagName: CreateName('form')
	});

	const afterSelected = (bChangeBright: boolean, rgb: [number, number, number]) => {
		const rgbaMap = RGBA.ToMap(...rgb);
		const palette = (form.GetChildren()[0] as IPalette);
		const navigation = (form.GetChildren()[2] as INavigation);
		if (bChangeBright) {
			palette.ChangeColor(rgbaMap);
			navigation.UpdateRGB(palette.GetColor());
			return;
		}

		navigation.UpdateRGB(rgbaMap);
	};

	const palette = Palette(230, 230, afterSelected);
	if (!palette) return;
	const hue = Hue(20, 230, afterSelected);
	if (!hue) return;
	const navigation = Navigation(palette, hue);

	form.Insert(palette, hue, navigation);

	palette.ChangeColor(RGBA.ToMap(255, 0, 0));
	navigation.UpdateRGB(RGBA.ToMap(0, 0, 0));

	return {
		Form: form,
		Navigation: navigation,
	};
};

export default Form;