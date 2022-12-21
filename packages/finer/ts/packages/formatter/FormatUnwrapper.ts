import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../Editor';
import { AllStrictFormats } from './Format';
import { EFormatType, IBlockFormat, IInlineFormat, IStyleFormat, TFormat } from './FormatType';
import FormatUtils from './FormatUtils';

export interface IFormatUnwrapper {
	Unwrap: (formats: TFormat | TFormat[], node: Node) => void,
}

const FormatUnwrapper = (editor: Editor): IFormatUnwrapper => {
	const self = editor;
	const DOM = self.DOM;

	const unwrapFormat = (oldNode: Node) => {
		const fragment = DOM.CreateFragment();
		fragment.append(...DOM.GetChildNodes(oldNode, false));
		(oldNode.parentElement as Element).replaceChild(fragment, oldNode);
	};

	const switchFormat = (tagName: string, oldNode: Node) => {
		if (DOM.Utils.GetNodeName(oldNode) === tagName) return oldNode;
		const newTag = DOM.Create(tagName);
		DOM.Insert(newTag, ...DOM.GetChildNodes(oldNode, false));
		(oldNode.parentElement as Element).replaceChild(newTag, oldNode);
	};

	const getClosestByStyles = (node: Node, styles: Record<string, string>): Node | null => {
		const closest = DOM.ClosestByStyle(FormatUtils.GetParentIfText(node) as HTMLElement, FormatUtils.GetStyleSelectorMap(styles));
		return closest;
	};

	const unwrapBlock = (format: IBlockFormat, node: Node) => {
		const { Tag, Switchable, AddInside, UnsetSwitcher } = format;
		const switchableSelector = Str.Join(',', ...Switchable);
		const addInsideSelector = Str.Join(',', ...AddInside);
		const oldElement: Element | null = FormatUtils.GetParentIfText(node) as Element;

		if (!DOM.Closest(oldElement, addInsideSelector)) return switchFormat(UnsetSwitcher ?? Tag, oldElement);

		let current: Element | null = DOM.Closest(oldElement, switchableSelector);
		while (current) {
			if (DOM.Utils.GetNodeName(current) !== Tag) {
				current = DOM.Closest(current.parentElement, switchableSelector);
				continue;
			}

			if (!DOM.Closest(current.parentElement, switchableSelector)) {
				unwrapFormat(current);
				break;
			}

			const nextSwitch = DOM.Closest(current.parentElement, switchableSelector);
			unwrapFormat(current);
			current = nextSwitch;
			continue;
		}
	};

	const unwrapInline = (format: IInlineFormat, node: Node) => {
		const { Tag, Styles } = format;

		const closest = !Styles
			? DOM.Closest(FormatUtils.GetParentIfText(node) as Element, Tag)
			: DOM.ClosestByStyle(FormatUtils.GetParentIfText(node) as Element, FormatUtils.GetStyleSelectorMap(Styles));
		if (!closest) return;

		const isUnwrappable = (selector: Node) => {
			if (!Styles) return DOM.Utils.GetNodeName(selector) === Tag;

			for (const [styleName, value] of Object.entries(Styles)) {
				const styleValue = value === '{{value}}' ? undefined : value;
				if (DOM.HasStyle(selector as HTMLElement, styleName, styleValue)) return true;
			}
			return false;
		};

		let toUnwrap = node;
		let current: Node | null = node.parentNode;

		while (current && !AllStrictFormats.has(DOM.Utils.GetNodeName(current))) {
			const currentNode = current;
			const bUnwrappable = isUnwrappable(currentNode);
			const children = DOM.GetChildNodes(currentNode);
			current = current.parentNode;
			if (!current) break;

			const replacedNodes: Node[] = [];

			const wrapNeedless = (child: Node): Node => {
				const wrapped = DOM.Clone(currentNode);
				DOM.Insert(wrapped, child);
				return wrapped;
			};

			for (const child of children) {
				if (DOM.HasAttr(child, 'marker')) {
					Arr.Push(replacedNodes, child);
					continue;
				}

				if (child !== toUnwrap || !bUnwrappable) {
					const wrapped = wrapNeedless(child);
					Arr.Push(replacedNodes, wrapped);

					if (child === toUnwrap) toUnwrap = wrapped;
					continue;
				}

				if (!Styles) {
					Arr.Push(replacedNodes, child);
					toUnwrap = child;
					continue;
				}

				const tempWrapped = wrapNeedless(child);
				for (const styleName of Object.keys(Styles)) {
					DOM.RemoveStyle(tempWrapped as HTMLElement, styleName);
				}

				if (Str.IsEmpty(DOM.GetAttr(tempWrapped, 'style'))) {
					Arr.Push(replacedNodes, child);
					toUnwrap = child;
					continue;
				}

				Arr.Push(replacedNodes, tempWrapped);
				toUnwrap = tempWrapped;
			}

			current.replaceChild(replacedNodes[0], currentNode);
			for (let index = 1, length = replacedNodes.length; index < length; ++index) {
				DOM.InsertAfter(replacedNodes[index - 1], replacedNodes[index]);
			}
		}
	};

	const unwrapStyleFormat = (format: IStyleFormat, node: Node) => {
		const { StrictFormats, Styles } = format;

		const closest = getClosestByStyles(node, Styles);
		if (!closest) return;
		if (!StrictFormats.has(DOM.Utils.GetNodeName(closest))) return;

		for (const styleName of Object.keys(Styles)) {
			DOM.RemoveStyle(closest as HTMLElement, styleName);
		}
	};

	const processUnwrap = (format: TFormat, node: Node) => {
		switch (format.FormatType) {
			case EFormatType.BLOCK:
				return unwrapBlock(format, node);
			case EFormatType.INLINE:
				return unwrapInline(format, node);
			case EFormatType.STYLE:
				return unwrapStyleFormat(format, node);
		}
	};

	const Unwrap = (formats: TFormat | TFormat[], node: Node) => {
		if (!Type.IsArray(formats)) return processUnwrap(formats, node);

		for (const format of formats) {
			processUnwrap(format, node);
		}
	};

	return {
		Unwrap,
	};
};

export default FormatUnwrapper;