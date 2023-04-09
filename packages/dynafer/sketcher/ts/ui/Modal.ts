import { Str, Type } from '@dynafer/utils';
import { IUISchemaMap } from '../types/UISchema';
import { IUISettingMap } from '../types/UISetting';
import { CreateTagName } from '../utils/UIUtils';
import Sketcher from './Sketcher';

const Modal = (name: string, setting: IUISettingMap['Modal']): IUISchemaMap['Modal'] => {
	const { Title, Icons, Body, Footer, Events } = setting;
	const CreateName = (tagName: string) => CreateTagName(name, tagName);

	const rootSchema = Sketcher.SketchOne({
		TagName: CreateName('modal'),
		Events,
	});

	rootSchema.BindRoot('keyup', (event: KeyboardEvent) => {
		if (Str.LowerCase(event.code) !== 'escape' && Str.LowerCase(event.key) !== 'escape') return;
		rootSchema.Destroy();
	}, true);

	const schema = Sketcher.SketchOne({
		TagName: CreateName('dialog'),
		Elements: [
			{
				TagName: CreateName('header'),
				Elements: [
					Title,
					{
						TagName: 'div',
						Elements: [Icons.Close],
						Events: [
							['click', () => rootSchema.Destroy()]
						]
					}
				]
			},
			{
				TagName: CreateName('body'),
				Elements: Body ? Type.IsArray(Body) ? Body : [Body] : undefined,
			},
			{
				TagName: CreateName('footer'),
				Elements: Footer ? Type.IsArray(Footer) ? Footer : [Footer] : undefined,
			},
		]
	});

	rootSchema.Insert(schema);

	const children = schema.GetChildren();

	return {
		Schema: rootSchema,
		Self: schema,
		Header: children[0],
		Body: children[1],
		Footer: children[2],
	};
};

export default Modal;