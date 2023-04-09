import { Attribute } from '@dynafer/dom-control';
import { Arr, Obj, Type } from '@dynafer/utils';
import DOMFactory, { IDOMFactory } from '../dom/DOMFactory';
import { ISketcherSetting } from '../types/UISetting';

export interface ISketcher {
	SketchOne: <T extends HTMLElement>(setting: ISketcherSetting<T>) => IDOMFactory<T>,
	Sketch: (settings: ISketcherSetting[]) => IDOMFactory[],
}

const Sketcher = (): ISketcher => {
	const SketchOne = <T extends HTMLElement>(setting: ISketcherSetting<T>): IDOMFactory<T> => {
		const { TagName, Elements, Events, Attributes, Classes } = setting;
		const sketch = DOMFactory(TagName);

		if (Type.IsArray(Elements)) {
			Arr.Each(Elements, element => {
				if (Type.IsString(element)) return sketch.InsertHtml(element);
				const bFactory = Obj.HasProperty<IDOMFactory<T>>(element, 'Doc');
				sketch.Insert(bFactory ? element : SketchOne(element));
			});
		}

		if (Type.IsArray(Events)) Arr.Each(Events, event => sketch.Bind(event[0], event[1]));

		if (Type.IsObject(Attributes)) Attribute.SetMultiple(sketch.Self, Attributes);

		if (Type.IsArray(Classes)) sketch.AddClass(...Classes);

		return sketch as IDOMFactory<T>;
	};

	const Sketch = (settings: ISketcherSetting[]): IDOMFactory[] => {
		const sketches: IDOMFactory[] = [];

		Arr.Each(settings, setting => Arr.Push(sketches, SketchOne(setting)));

		return sketches;
	};

	return {
		SketchOne,
		Sketch,
	};
};

export default Sketcher();