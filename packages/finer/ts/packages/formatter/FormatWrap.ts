import Editor from '../Editor';
import { EFormatType, IFormattingOption } from './FormatType';

export interface IFormatWrap {
	WrapRecursive: (formatting: IFormattingOption, children: Node[], checker: (node: Node) => boolean) => Node[],
}

const FormatWrap = (editor: Editor): IFormatWrap => {
	const self = editor;
	const DOM = self.DOM;

	const WrapRecursive = (formatting: IFormattingOption, children: Node[], checker: (node: Node) => boolean): Node[] => {
		const { Type, Format, Option } = formatting;
		const nodes = [...children];
		for (let index = 0; index < nodes.length; ++index) {
			const child = nodes[index];

			if (DOM.Utils.IsText(child)) {
				if (
					Type === EFormatType.STYLE
					&& child.parentNode
					&& child.parentNode.childNodes.length === 1
					&& DOM.Utils.GetNodeName(child.parentNode) === Format
				) {
					DOM.SetStyles(child.parentNode as HTMLElement, Option.styles as Record<string, string>);
					continue;
				}

				const newTag = DOM.Create(Format, {
					...Option,
					children: [DOM.Clone(child, true)]
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