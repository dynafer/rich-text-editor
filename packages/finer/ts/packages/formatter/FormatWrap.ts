import Editor from '../Editor';
import { IFormattingOption } from './FormatType';

export interface IFormatWrap {
	WrapRecursive: (formatting: IFormattingOption, children: Node[], checker: (node: Node) => boolean) => Node[],
}

const FormatWrap = (editor: Editor): IFormatWrap => {
	const self = editor;
	const DOM = self.DOM;

	const WrapRecursive = (formatting: IFormattingOption, children: Node[], checker: (node: Node) => boolean): Node[] => {
		const nodes = [ ...children ];
		for (let index = 0; index < nodes.length; ++ index) {
			const child = nodes[index];

			if (DOM.Utils.IsText(child)) {
				const newTag = DOM.Create(formatting.format, {
					...formatting.option,
					children: [ DOM.Clone(child, true) ]
				});

				nodes[index] = newTag;

				continue;
			}

			if (!checker(child))
				(child as HTMLElement).replaceChildren(...WrapRecursive(formatting, Array.from(child.childNodes), checker));
		}

		return nodes;
	};

	return {
		WrapRecursive
	};
};

export default FormatWrap;