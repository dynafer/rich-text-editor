import Editor from '../Editor';
import { EFormatType, IFormatOptionBase } from './FormatType';

export const CheckFormat = (editor: Editor, option: IFormatOptionBase) =>
	(node: Node): boolean => {
		switch (option.type) {
			case EFormatType.TAG:
				return editor.DOM.Utils.GetNodeName(node) === option.format;
			case EFormatType.STYLE:
				return editor.DOM.HasStyle(node as HTMLElement, option.format, option.formatValue);
			default:
				return false;
		}
	};
