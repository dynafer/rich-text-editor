import Editor from '../Editor';
import { EFormatType, IFormattingOption, IToggleSetting } from './FormatType';
import FormatUnwrap, { IFormatUnwrap } from './FormatUnwrap';
import FormatWrap, { IFormatWrap } from './FormatWrap';

interface IToggleOneLineCallback<T extends Node = ParentNode> {
	(parent: T): void;
}

interface IToggleRangeCallback {
	(firstNodes: Node[], middleNodes: Node[], lastNodes: Node[]): void;
}

interface IToggleOneLine {
	<T extends ParentNode>(bWrap: boolean, setting: IToggleSetting<T>, callback: IToggleOneLineCallback<T>): T;
	(bWrap: boolean, setting: IToggleSetting, callback: IToggleOneLineCallback): ParentNode;
}

interface IToggleRange {
	<T extends ParentNode>(bWrap: boolean, setting: IToggleSetting<T>, callback: IToggleRangeCallback): T;
	(bWrap: boolean, setting: IToggleSetting, callback: IToggleRangeCallback): ParentNode;
}

export interface IFormatToggle {
	Wrap: IFormatWrap,
	Unwrap: IFormatUnwrap,
	GetFormattingOption: (type: EFormatType, format: string, formatValue?: string) => IFormattingOption,
	ToggleOneLineRange: IToggleOneLine,
	ToggleRange: IToggleRange,
}

const FormatToggle = (editor: Editor): IFormatToggle => {
	const self = editor;
	const Wrap = FormatWrap(self);
	const Unwrap = FormatUnwrap(self);

	const GetFormattingOption = (type: EFormatType, format: string, formatValue?: string): IFormattingOption => {
		const formattingOption: IFormattingOption = {
			Type: type,
			Format: type === EFormatType.STYLE ? 'span' : format,
			StyleFormat: format,
			Option: {}
		};

		if (type === EFormatType.STYLE && formatValue) {
			formattingOption.Option.styles = {};
			formattingOption.Option.styles[format] = formatValue;
		}

		return formattingOption;
	};

	const ToggleOneLineRange = (bWrap: boolean, setting: IToggleSetting, callback: IToggleOneLineCallback): ParentNode => {
		const { Type, Format, FormatValue, Parent, Checker } = setting;
		const wrapOrUnwrap = bWrap ? Wrap.WrapRecursive : Unwrap.UnwrapRecursive;
		const children: Node[] = Array.from(Parent.childNodes);
		const replacer = wrapOrUnwrap(GetFormattingOption(Type, Format, FormatValue), children, Checker);

		Parent.replaceChildren(...replacer);

		callback(Parent);

		return Parent;
	};

	const ToggleRange = (bWrap: boolean, setting: IToggleSetting, callback: IToggleRangeCallback): ParentNode => {
		const { Type, Format, FormatValue, Parent, Checker } = setting;
		const wrapOrUnwrap = bWrap ? Wrap.WrapRecursive : Unwrap.UnwrapRecursive;
		const formattingOption = GetFormattingOption(Type, Format, FormatValue);

		const children: Node[] = Array.from(Parent.childNodes);

		const firstNodes = wrapOrUnwrap(formattingOption, Array.from(children[0].childNodes), Checker);
		const middleNodes: Node[] = [];
		const lastNodes = wrapOrUnwrap(formattingOption, Array.from(children[children.length - 1].childNodes), Checker);

		for (let index = 1, length = children.length - 1; index < length; ++index) {
			ToggleOneLineRange(bWrap,
				{ Type, Format, FormatValue, Parent: children[index] as ParentNode, Checker },
				(wrapped) => {
					middleNodes.push(wrapped);
				}
			);
		}

		callback(firstNodes, middleNodes, lastNodes);

		return Parent;
	};

	return {
		Wrap,
		Unwrap,
		GetFormattingOption,
		ToggleOneLineRange,
		ToggleRange,
	};
};

export default FormatToggle;