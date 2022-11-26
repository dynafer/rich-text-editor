import { Attribute } from '@dynafer/dom-control';
import { Type } from '@dynafer/utils';
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
			for (const element of Elements) {
				if (Type.IsString(element)) {
					sketch.InsertHtml(element);
					continue;
				}

				sketch.Insert(element['Doc'] ? element as IDOMFactory : SketchOne(element as ISketcherSetting));
			}
		}

		if (Type.IsArray(Events)) {
			for (const event of Events) {
				sketch.Bind(event[0], event[1]);
			}
		}

		if (Type.IsObject(Attributes)) Attribute.SetMultiple(sketch.Self, Attributes);

		return sketch;
	};

	const Sketch = (settings: ISketcherSetting[]): IDOMFactory[] => {
		const sketches: IDOMFactory[] = [];

		for (const setting of settings) {
			sketches.push(SketchOne(setting));
		}

		return sketches;
	};

	return {
		SketchOne,
		Sketch,
	};
};

export default Sketcher();