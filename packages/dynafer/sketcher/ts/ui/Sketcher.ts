import { Attribute } from '@dynafer/dom-control';
import { Arr, Obj, Type } from '@dynafer/utils';
import DOMFactory from '../dom/DOMFactory';
import { ISketcherSetting } from '../types/UISetting';

export interface ISketcher {
	SketchOne: <T extends HTMLElement>(setting: ISketcherSetting<T>) => DOMFactory<T>,
	Sketch: (settings: ISketcherSetting[]) => DOMFactory[],
}

const Sketcher = (): ISketcher => {
	const SketchOne = <T extends HTMLElement>(setting: ISketcherSetting<T>): DOMFactory<T> => {
		const { TagName, Elements, Events, Attributes, Classes } = setting;
		const sketch = new DOMFactory<T>(TagName);

		if (Type.IsArray(Elements))
			Arr.Each(Elements, element => {
				if (Type.IsString(element)) return sketch.Insert(element);
				const bFactory = Obj.HasProperty<DOMFactory<T>>(element, 'Doc');
				sketch.Insert(bFactory ? element : SketchOne(element));
			});

		if (Type.IsArray(Events)) Arr.Each(Events, event => sketch.Bind(event[0], event[1]));
		if (Type.IsObject(Attributes)) Attribute.SetMultiple(sketch.Self, Attributes);
		if (Type.IsArray(Classes)) sketch.AddClass(...Classes);

		return sketch;
	};

	const Sketch = (settings: ISketcherSetting[]): DOMFactory[] => {
		const sketches: DOMFactory[] = [];

		Arr.Each(settings, setting => Arr.Push(sketches, SketchOne(setting)));

		return sketches;
	};

	return {
		SketchOne,
		Sketch,
	};
};

export default Sketcher();