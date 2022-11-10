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
	GetWrappingOption: (type: EFormatType, format: string, formatValue: string | undefined) => IFormattingOption,
	ToggleOneLineRange: IToggleOneLine,
	ToggleRange: IToggleRange,
}

const FormatToggle = (editor: Editor): IFormatToggle => {
	const self = editor;
	const Wrap = FormatWrap(self);
	const Unwrap = FormatUnwrap(self);

	const GetWrappingOption = (type: EFormatType, format: string, formatValue: string | undefined): IFormattingOption => {
		const formattingOption: IFormattingOption = {
			format: type === EFormatType.STYLE ? 'span' : format,
			option: {}
		};

		if (type === EFormatType.STYLE && formatValue) {
			formattingOption.option.styles = {};
			formattingOption.option.styles[format] = formatValue;
		}

		return formattingOption;
	};

	const ToggleOneLineRange = (bWrap: boolean, setting: IToggleSetting, callback: IToggleOneLineCallback): ParentNode => {
		const type = setting.type;
		const format = setting.format;
		const formatValue = setting.formatValue;
		const parent = setting.parent;
		const checker = setting.checker;
		const wrapOrUnwrap = bWrap ? Wrap.WrapRecursive : Unwrap.UnwrapRecursive;

		const children: Node[] = Array.from(parent.childNodes);
		const replacer = wrapOrUnwrap(GetWrappingOption(type, format, formatValue), children, checker);

		parent.replaceChildren(...replacer);

		callback(parent);

		return parent;
	};

	const ToggleRange = (bWrap: boolean, setting: IToggleSetting, callback: IToggleRangeCallback): ParentNode => {
		const type = setting.type;
		const format = setting.format;
		const formatValue = setting.formatValue;
		const parent = setting.parent;
		const checker = setting.checker;
		const wrapOrUnwrap = bWrap ? Wrap.WrapRecursive : Unwrap.UnwrapRecursive;
		const formattingOption = GetWrappingOption(type, format, formatValue);

		const children: Node[] = Array.from(parent.childNodes);

		const firstNodes = wrapOrUnwrap(formattingOption, Array.from(children[0].childNodes), checker);
		const middleNodes: Node[] = [];
		const lastNodes = wrapOrUnwrap(formattingOption, Array.from(children[children.length - 1].childNodes), checker);

		for (let index = 1, length = children.length - 1; index < length; ++ index) {
			ToggleOneLineRange(bWrap,
				{ type, format, formatValue, parent: children[index] as ParentNode, checker },
				(wrapped) => {
					middleNodes.push(wrapped);
				}
			);
		}

		callback(firstNodes, middleNodes, lastNodes);

		return parent;
	};

	return {
		Wrap,
		Unwrap,
		GetWrappingOption,
		ToggleOneLineRange,
		ToggleRange,
	};
};

export default FormatToggle;