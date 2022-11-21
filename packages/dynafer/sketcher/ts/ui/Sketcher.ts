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
		const sketch = DOMFactory(setting.tagName);

		if (Type.IsArray(setting.elements)) {
			for (const element of setting.elements) {
				if (Type.IsString(element)) {
					sketch.InsertHtml(element);
					continue;
				}

				sketch.Insert(element['Doc'] ? element as IDOMFactory : SketchOne(element as ISketcherSetting));
			}
		}

		if (Type.IsArray(setting.events)) {
			for (const event of setting.events) {
				sketch.Bind(event[0], event[1]);
			}
		}

		if (Type.IsObject(setting.attributes)) Attribute.SetMultiple(sketch.Self, setting.attributes);

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