import { IDOMFactory, Sketcher } from '@dynafer/sketcher';
import { RGBA, CreateName, IRGBA } from '../utils/Utils';

export interface IPalette extends IDOMFactory {
	GetColor: () => IRGBA,
	ChangeColor: (rgb: IRGBA) => void,
	UpdateGuide: (rgb: IRGBA) => void,
}

const Palette = (width: number, height: number, afterSelected: (bChangeBright: boolean, rgb: [number, number, number]) => void): IPalette | undefined => {
	const palette = Sketcher.Palette({
		Width: width,
		Height: height
	});
	if (!palette) return;

	const guidance = Sketcher.PaletteGuide({
		Palette: palette.Self,
		bOnlyVertical: false,
		Guiding: () => afterSelected(false, palette.GetRGB(guidance.GetX(), guidance.GetY()))
	});

	const schema = Sketcher.SketchOne({
		TagName: CreateName('palette'),
		Elements: [palette.Self, guidance.Self]
	});

	const GetColor = (): IRGBA => RGBA.ToMap(...palette.GetRGB(guidance.GetX(), guidance.GetY()));

	const ChangeColor = (rgb: IRGBA) => {
		palette.FillRect(RGBA.ToString(rgb));

		const gradientWhite = palette.CreateGradient(0, 0, width, 0);
		palette.ColorStop(gradientWhite, [
			[0.01, RGBA.ArrayToString(255, 255, 255, 1)],
			[0.99, RGBA.ArrayToString(255, 255, 255, 0)]
		]);
		palette.FillRect(gradientWhite);

		const gradientBlack = palette.CreateGradient(0, 0, 0, height);
		palette.ColorStop(gradientBlack, [
			[0.1, RGBA.ArrayToString(0, 0, 0, 0)],
			[0.99, RGBA.ArrayToString(0, 0, 0, 1)]
		]);
		palette.FillRect(gradientBlack);
	};

	const UpdateGuide = (rgb: IRGBA) => {
		const hsv = RGBA.ToHSV(rgb);
		guidance.SetGuidance(Math.round(width / 100 * hsv.Saturation), Math.round(height / 100 * (100 - hsv.Value)));
	};

	return {
		...schema,
		GetColor,
		ChangeColor,
		UpdateGuide,
	};
};

export default Palette;