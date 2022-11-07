import Editor from '../Editor';
import { EFormatType, IFormatBase } from './FormatType';

export const CheckFormat = (editor: Editor, format: IFormatBase) =>
	(node: Node): boolean => {
		switch (format.type) {
			case EFormatType.tag:
				return editor.DOM.Utils.GetNodeName(node) === format.format;
			case EFormatType.style:
				return editor.DOM.HasStyle(node as HTMLElement, format.format, format.formatValue);
			default:
				return false;
		}
	};
