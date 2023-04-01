import { NodeType } from '@dynafer/dom-control';
import { Arr, Obj, Str, Type } from '@dynafer/utils';
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

	const createStyleMap = (styles: Record<string, string>, value?: string): Record<string, string> => {
		const styleMap: Record<string, string> = {};
		Obj.Entries(styles, (styleName, styleValue) => {
			styleMap[styleName] = value ? styleValue.replace('{{value}}', value) : styleValue;
		});

		return styleMap;
	};

	const wrapFormat = (oldNode: Node, tagName: string, styles?: Record<string, string>) => {
		if (tagName === DOM.Utils.GetNodeName(oldNode)) return;
		const newNode = DOM.Create(tagName);
		if (!!styles) DOM.SetStyles(newNode, styles);
		const insertions = NodeType.IsText(oldNode) || DOM.Utils.IsBr(oldNode) ? [oldNode] : DOM.GetChildNodes(oldNode, false);
		DOM.CloneAndInsert(newNode, true, ...insertions);
		oldNode.parentElement?.replaceChild(newNode, oldNode);
	};

	const mergeStyle = (node: Node, styles: Record<string, string>) =>
		Obj.Entries(styles, (styleName, styleValue) => {
			if (DOM.HasStyle(node, styleName, styleValue)) return;

			DOM.SetStyle(node, styleName, styleValue);
		});

	const wrapBlock = (format: IBlockFormat, node: Node) => {
		const { Tag, Switchable, AddInside } = format;
		let current: Node | null = node;
		let parent: Node | null = node;
		while (parent && parent !== self.GetBody()) {
			const nodeName = DOM.Utils.GetNodeName(parent);
			const bSkipCurrent = (!Switchable.has(nodeName) && !AddInside.has(nodeName))
				|| (Switchable.has(nodeName) && AddInside.has(DOM.Utils.GetNodeName(parent.parentNode)));

			if (bSkipCurrent) {
				current = parent;
				parent = parent.parentNode;
				continue;
			}

			if (Switchable.has(nodeName)) return wrapFormat(parent, Tag);

			if (!AddInside.has(nodeName)) continue;

			return wrapFormat(current, Tag);
		}
	};

	const wrapInline = (format: IInlineFormat, node: Node, value?: string) => {
		const { Tag, Styles } = format;

		const elementForCheck = FormatUtils.GetParentIfText(node);

		if (!Styles) {
			if (DOM.Closest(elementForCheck, Tag) || AllBlockFormats.has(DOM.Utils.GetNodeName(node))) return;

			return wrapFormat(node, Tag);
		}

		const styles = createStyleMap(Styles, value);

		const closestStyle = DOM.Closest(elementForCheck, DOM.Utils.CreateAttrSelector('style')) as Node | null;
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
		const { StrictFormats, Styles, SameStyles } = format;

		const parent = DOM.Closest(FormatUtils.GetParentIfText(node), Str.Join(',', ...StrictFormats));
		if (!parent) return false;

		const styles = createStyleMap(Styles, value);

		const removeStyles = () => {
			if (!Type.IsArray(SameStyles)) return;
			Arr.Each(SameStyles, styleName => DOM.RemoveStyle(parent, styleName));
		};

		removeStyles();
		mergeStyle(parent, styles);
		return true;
	};

	const Wrap = (formats: TFormat | TFormat[], node: Node, value?: string) => {
		const format = Type.IsArray(formats) ? formats[0] : formats;
		switch (format.Type) {
			case EFormatType.BLOCK:
				return wrapBlock(format, node);
			case EFormatType.INLINE:
				return wrapInline(format, node, value);
			case EFormatType.STYLE:
				if (!Type.IsArray(formats)) return wrapStyleFormat(format, node, value);

				return Arr.Each(formats, (styleFormat, exit) => {
					if (styleFormat.Type !== EFormatType.STYLE) return;
					if (wrapStyleFormat(styleFormat, node, value)) exit();
				});
		}
	};

	return {
		Wrap,
	};
};

export default FormatWrapper;