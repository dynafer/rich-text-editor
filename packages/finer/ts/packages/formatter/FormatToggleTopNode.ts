import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { ICaretData } from '../editorUtils/caret/CaretUtils';
import { EFormatType, IFormatToggleTopNodeSetting } from './FormatType';

const FormatToggleTopNode = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const getIndexsFarFromTopNode = (node: Node): number[] => {
		const indexes: number[] = [];
		let currentNode = node;
		while (currentNode.parentNode !== self.GetBody()) {
			const parentNode = currentNode.parentNode as Node;
			const index = Arr.Find(parentNode.childNodes, currentNode as ChildNode);
			Arr.Unshift(indexes, index);
			currentNode = currentNode.parentNode as Node;
		}

		return indexes;
	};

	const getNodeFromTopNode = (topNode: Node, indexes: number[]): Node => {
		let node = topNode;
		for (const index of indexes) {
			node = node.childNodes[index];
		}

		return node;
	};

	const changeTag = (bToggle: boolean, format: string, topNode: Node, caret: ICaretData): Range => {
		const bRange = caret.IsRange();
		const startPathIndex: number[] = getIndexsFarFromTopNode(caret.Start.Node);
		const endPathIndex: number[] = bRange ? getIndexsFarFromTopNode(caret.End.Node) : [];

		const newTag = DOM.Create(bToggle ? format : 'p');
		for (const child of topNode.childNodes) {
			DOM.Insert(newTag, child.cloneNode(true));
		}

		self.GetBody().replaceChild(newTag, topNode);

		caret.Range.SetStart(getNodeFromTopNode(newTag, startPathIndex), caret.Start.Offset);
		if (bRange) caret.Range.SetEnd(getNodeFromTopNode(newTag, endPathIndex), caret.End.Offset);

		return caret.Range.Clone();
	};

	const calculateStyle = (option: Pick<IFormatToggleTopNodeSetting, 'Format' | 'TopNode' | 'DefaultValue' | 'bSubtract'>) => {
		const { Format, TopNode, DefaultValue, bSubtract } = option;
		if (!DefaultValue) return;
		const styleValue = self.DOM.GetStyle(TopNode as HTMLElement, Format, true);
		let convertedValue: string | number = bSubtract ? parseFloat(styleValue) - parseFloat(DefaultValue) : parseFloat(styleValue) + parseFloat(DefaultValue);
		const bZero = convertedValue <= 0;
		if (!bZero) convertedValue = Str.Merge(convertedValue.toString(), 'px');

		const toggle = bZero ? self.DOM.RemoveStyle : self.DOM.SetStyle;
		toggle(TopNode as HTMLElement, Format, convertedValue.toString());
	};

	const toggleStyle = (option: Pick<IFormatToggleTopNodeSetting, 'Format' | 'FormatValue' | 'TopNode'>, bToggle: boolean) => {
		const { Format, FormatValue, TopNode, } = option;
		if (!FormatValue) return;
		const toggle = bToggle ? DOM.SetStyle : DOM.RemoveStyle;
		toggle(TopNode as HTMLElement, Format, FormatValue);
	};

	const Toggle = (bToggle: boolean, setting: IFormatToggleTopNodeSetting, caret: ICaretData): Range | null => {
		const { Type, Format, FormatValue, TopNode, bCalculate } = setting;

		switch (Type) {
			case EFormatType.TAG:
				return changeTag(bToggle, Format, TopNode, caret);
			case EFormatType.STYLE:
				if (!bCalculate && !FormatValue) return null;
				const toggle = bCalculate ? calculateStyle : toggleStyle;
				toggle(setting, bToggle);
				return caret.Range.Clone();
			default:
				return null;
		}
	};

	return {
		Toggle,
	};
};

export default FormatToggleTopNode;