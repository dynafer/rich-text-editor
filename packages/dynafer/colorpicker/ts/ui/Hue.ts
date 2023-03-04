import { IDOMFactory, Sketcher } from '@dynafer/sketcher';
import { CreateName, IRGBA, RGBA } from '../utils/Utils';

export interface IHue extends IDOMFactory {
	UpdateGuide: (rgb: IRGBA) => void,
}

const Hue = (width: number, height: number, afterSelected: (bChangeBright: boolean, rgb: [number, number, number]) => void): IHue | undefined => {
	const palette = Sketcher.Palette({
		Width: width,
		Height: height,
	});
	if (!palette) return;

	const guidance = Sketcher.PaletteGuide({
		Palette: palette.Self,
		bOnlyVertical: true,
		Guiding: () => afterSelected(true, palette.GetRGB(guidance.GetX(), guidance.GetY() - 1))
	});

	const schema = Sketcher.SketchOne({
		TagName: CreateName('hue'),
		Elements: [palette.Self, guidance.Self]
	});

	const gradient = palette.CreateGradient(0, 0, 0, height);
	palette.ColorStop(gradient, [
		[0.01, RGBA.ArrayToString(255, 0, 0)],
		[1 / 6, RGBA.ArrayToString(255, 255, 0)],
		[1 / 3, RGBA.ArrayToString(0, 255, 0)],
		[1 / 2, RGBA.ArrayToString(0, 255, 255)],
		[2 / 3, RGBA.ArrayToString(0, 0, 255)],
		[5 / 6, RGBA.ArrayToString(255, 0, 255)],
		[0.99, RGBA.ArrayToString(255, 0, 0)],
	]);
	palette.FillRect(gradient);

	const UpdateGuide = (rgb: IRGBA) => guidance.SetGuidance(0, Math.round(height / 360 * RGBA.ToHSV(rgb).Hue));

	return {
		...schema,
		UpdateGuide,
	};
};

export default Hue;