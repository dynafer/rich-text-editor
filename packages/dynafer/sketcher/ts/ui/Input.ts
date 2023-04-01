import { Str } from '@dynafer/utils';
import { IUISchemaMap } from '../types/UISchema';
import { IUISettingMap } from '../types/UISetting';
import Sketcher from './Sketcher';

const Input = (setting: IUISettingMap['Input']): IUISchemaMap['Input'] => {
	const { Label, Placeholder, Value, Events } = setting;
	const schema = Sketcher.SketchOne({
		TagName: 'label',
		Elements: [
			{
				TagName: 'div',
				Elements: [Label ?? '']
			},
			{
				TagName: 'input',
				Events
			}
		]
	});

	const input = schema.GetChildren<HTMLInputElement>()[1];

	const GetValue = (): string => input.Self.value;
	const SetValue = (val: string): string => input.Self.value = val;

	if (Placeholder && !Str.IsEmpty(Label)) input.Self.placeholder = Placeholder;
	if (Value && !Str.IsEmpty(Value)) SetValue(Value);

	return {
		Schema: schema,
		Self: input,
		GetValue,
		SetValue,
	};
};

export default Input;