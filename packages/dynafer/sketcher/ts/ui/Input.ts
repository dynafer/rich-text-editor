import { Str } from '@dynafer/utils';
import { IDOMFactory } from '../dom/DOMFactory';
import { IUISchemaMap } from '../types/UISchema';
import { IUISettingMap } from '../types/UISetting';
import Sketcher from './Sketcher';

const Input = (setting: IUISettingMap['Input']): IUISchemaMap['Input'] => {
	const { label, placeholder, value, events } = setting;
	const schema = Sketcher.SketchOne({
		tagName: 'label',
		elements: [
			{
				tagName: 'div',
				elements: [label ?? '']
			},
			{
				tagName: 'input',
				events
			}
		]
	});

	const input = schema.GetChildren()[1] as IDOMFactory<HTMLInputElement>;

	const GetValue = () => input.Self.value;
	const SetValue = (val: string) => input.Self.value = val;

	if (placeholder && !Str.IsEmpty(label)) input.Self.placeholder = placeholder;
	if (value && !Str.IsEmpty(value)) SetValue(value);

	return {
		Schema: schema,
		Self: input,
		GetValue,
		SetValue,
	};
};

export default Input;