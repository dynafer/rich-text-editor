import DOMFactory, { IDOMFactory } from './dom/DOMFactory';
import Input from './ui/Input';
import Modal from './ui/Modal';
import Palette from './ui/Palette';
import PaletteGuide from './ui/PaletteGuide';
import sketcher from './ui/Sketcher';

const Sketcher = {
	Input,
	Modal,
	Palette,
	PaletteGuide,
	Sketch: sketcher.Sketch,
	SketchOne: sketcher.SketchOne,
};

export * as Schema from './types/UISchema';

export {
	Sketcher,
	DOMFactory,

	IDOMFactory,
};