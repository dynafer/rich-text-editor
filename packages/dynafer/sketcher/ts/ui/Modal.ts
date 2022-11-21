import { Type } from '@dynafer/utils';
import { IUISchemaMap } from '../types/UISchema';
import { IUISettingMap } from '../types/UISetting';
import { CreateTagName } from '../utils/UIUtils';
import Sketcher from './Sketcher';

const Modal = (name: string, setting: IUISettingMap['Modal']): IUISchemaMap['Modal'] => {
	const { title, icons, body, footer, events } = setting;
	const CreateName = (tagName: string) => CreateTagName(name, tagName);

	const rootSchema = Sketcher.SketchOne({
		tagName: CreateName('modal'),
		events
	});

	const schema = Sketcher.SketchOne({
		tagName: CreateName('dialog'),
		elements: [
			{
				tagName: CreateName('header'),
				elements: [
					title,
					{
						tagName: 'div',
						elements: [icons.close],
						events: [
							['click', () => rootSchema.Destroy()]
						]
					}
				]
			},
			{
				tagName: CreateName('body'),
				elements: body ? Type.IsArray(body) ? body : [body] : undefined,
			},
			{
				tagName: CreateName('footer'),
				elements: footer ? Type.IsArray(footer) ? footer : [footer] : undefined,
			},
		]
	});

	rootSchema.Insert(schema);

	const children = schema.GetChildren();

	const Header = children[0];
	const Body = children[1];
	const Footer = children[2];

	return {
		Schema: rootSchema,
		Self: schema,
		Header,
		Body,
		Footer,
	};
};

export default Modal;