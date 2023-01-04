import { Type } from '@dynafer/utils';
import Editor from '../Editor';
import { AllBlockFormats } from './Format';
import { EFormatType, IBlockFormat, IInlineFormat, IStyleFormat, TFormat } from './FormatType';
import FormatUtils from './FormatUtils';

export interface IFormatWrapper {
	Wrap: (formats: TFormat | TFormat[], node: Node, value?: string) => void,
}

const FormatWrapper = (editor: Editor): IFormatWrapper => {
	const self = editor;
	const DOM = self.DOM;

	const wrapFormat = (oldNode: Node, tagName: string, styles?: Record<string, string>) => {
		if (tagName === DOM.Utils.GetNodeName(oldNode)) return;
		const newNode = DOM.Create(tagName);
		if (!!styles) DOM.SetStyles(newNode, styles);
		const insertions = DOM.Utils.IsText(oldNode) || DOM.Utils.IsBr(oldNode) ? [oldNode] : DOM.GetChildNodes(oldNode, false);
		DOM.CloneAndInsert(newNode, true, ...insertions);
		const parent = oldNode.parentElement as Element;
		parent.replaceChild(newNode, oldNode);
	};

	const mergeStyle = (node: Node, styles: Record<string, string>) => {
		for (const [styleName, styleValue] of Object.entries(styles)) {
			if (DOM.HasStyle(node as HTMLElement, styleName, styleValue)) continue;

			DOM.SetStyle(node as HTMLElement, styleName, styleValue);
		}
	};

	const wrapBlock = (format: IBlockFormat, node: Node) => {
		const { Tag, Switchable, AddInside } = format;
		let current: Node | null = node;
		let parent: Node | null = node;
		while (parent && (parent !== self.GetBody())) {
			const nodeName = DOM.Utils.GetNodeName(parent);
			const bSkipCurrent = (!Switchable.has(nodeName) && !AddInside.has(nodeName))
				|| (Switchable.has(nodeName) && AddInside.has(DOM.Utils.GetNodeName(parent.parentNode)));

			if (bSkipCurrent) {
				current = parent;
				parent = parent.parentNode;
				continue;
			}

			if (Switchable.has(nodeName)) {
				const oldNode = parent;
				return wrapFormat(oldNode, Tag);
			}

			if (!AddInside.has(nodeName)) continue;

			const oldNode = current;
			return wrapFormat(oldNode, Tag);
		}
	};

	const wrapInline = (format: IInlineFormat, node: Node, value?: string) => {
		const { Tag, Styles } = format;

		const elementForCheck = FormatUtils.GetParentIfText(node) as Element;

		if (!Styles) {
			if (DOM.Closest(elementForCheck, Tag)) return;
			if (AllBlockFormats.has(DOM.Utils.GetNodeName(node))) return;

			return wrapFormat(node, Tag);
		}

		const closestStyle: Node | null = DOM.Closest(elementForCheck, DOM.Utils.CreateAttrSelector('style')) as Node | null;

		const styles = {};
		for (const [styleName, styleValue] of Object.entries(Styles)) {
			styles[styleName] = value ? styleValue.replace('{{value}}', value) : styleValue;
		}

		if (!closestStyle) return wrapFormat(node, Tag, styles);

		let currentChild = closestStyle;
		while (currentChild) {
			const children = DOM.GetChildNodes(currentChild, false);
			if (children.length > 1) return wrapFormat(node, Tag, styles);
			if (currentChild === node) return mergeStyle(closestStyle, styles);

			currentChild = children[0];
		}
	};

	const wrapStyleFormat = (format: IStyleFormat, node: Node, value?: string): boolean => {
		const { StrictFormats, Styles } = format;

		const styles = {};
		for (const [styleName, styleValue] of Object.entries(Styles)) {
			styles[styleName] = value ? styleValue.replace('{{value}}', value) : styleValue;
		}

		let currentParent: Node | null = node;
		while (currentParent) {
			if (StrictFormats.has(DOM.Utils.GetNodeName(currentParent))) {
				mergeStyle(currentParent, styles);
				return true;
			}

			currentParent = currentParent.parentNode;
		}

		return false;
	};

	const Wrap = (formats: TFormat | TFormat[], node: Node, value?: string) => {
		const format = Type.IsArray(formats) ? formats[0] : formats;
		switch (format.FormatType) {
			case EFormatType.BLOCK:
				return wrapBlock(format, node);
			case EFormatType.INLINE:
				return wrapInline(format, node, value);
			case EFormatType.STYLE:
				if (!Type.IsArray(formats)) {
					wrapStyleFormat(format, node, value);
					return;
				}

				for (const styleFormat of formats) {
					if (wrapStyleFormat(styleFormat as IStyleFormat, node, value)) break;
				}
				return;
		}
	};

	return {
		Wrap,
	};
};

export default FormatWrapper;