import { Attribute } from '@dynafer/dom-control';
import { Arr, Type } from '@dynafer/utils';
import DOMFactory, { IDOMFactory } from '../dom/DOMFactory';
import { ISketcherSetting } from '../types/UISetting';

export interface ISketcher {
	SketchOne: (setting: ISketcherSetting) => IDOMFactory,
	Sketch: (settings: ISketcherSetting[]) => IDOMFactory[],
}

const Sketcher = (): ISketcher => {
	const SketchOne = (setting: ISketcherSetting): IDOMFactory => {
		const { TagName, Elements, Events, Attributes } = setting;
		const sketch = DOMFactory(TagName);

		if (Type.IsArray(Elements)) {
			Arr.Each(Elements, element => {
				if (Type.IsString(element)) return sketch.InsertHtml(element);
				sketch.Insert(!!(element as IDOMFactory).Doc ? element as IDOMFactory : SketchOne(element as ISketcherSetting));
			});
		}

		if (Type.IsArray(Events)) Arr.Each(Events, event => sketch.Bind(event[0], event[1]));

		if (Type.IsObject(Attributes)) Attribute.SetMultiple(sketch.Self, Attributes);

		return sketch;
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