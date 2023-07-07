import { Arr, Obj, Str, Type } from '@dynafer/utils';
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
		oldNode.parentElement?.replaceChild(fragment, oldNode);
	};

	const switchFormat = (tagName: string, oldNode: Node) => {
		if (DOM.Utils.GetNodeName(oldNode) === tagName) return;
		const newTag = DOM.Create(tagName);
		DOM.Insert(newTag, ...DOM.GetChildNodes(oldNode, false));
		oldNode.parentElement?.replaceChild(newTag, oldNode);
	};

	const getClosestByStyles = (node: Node, styles: Record<string, string>): Node | null =>
		DOM.ClosestByStyle(FormatUtils.GetParentIfText(node), FormatUtils.GetStyleSelectorMap(styles));

	const unwrapBlock = (format: IBlockFormat, node: Node): boolean => {
		const { Tag, Switchable, AddInside, UnsetSwitcher } = format;
		const switchableSelector = Str.Join(',', ...Switchable);
		const addInsideSelector = Str.Join(',', ...AddInside);
		const oldElement = FormatUtils.GetParentIfText(node);

		if (!DOM.Closest(oldElement, addInsideSelector) || DOM.Element.Table.FindClosestCell(oldElement)) {
			const blockElement = DOM.Closest(oldElement, Tag);
			if (!blockElement) return true;

			switchFormat(UnsetSwitcher ?? Tag, blockElement);
			return true;
		}

		let current = DOM.Closest(oldElement, switchableSelector);
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
		}

		return true;
	};

	const unwrapInline = (format: IInlineFormat, node: Node): boolean => {
		const { Tag, Styles } = format;

		const closest = !Styles
			? DOM.Closest(FormatUtils.GetParentIfText(node), Tag)
			: DOM.ClosestByStyle(FormatUtils.GetParentIfText(node), FormatUtils.GetStyleSelectorMap(Styles));
		if (!closest) return false;

		const isUnwrappable = (selector: Node): boolean => {
			if (!Styles) return DOM.Utils.GetNodeName(selector) === Tag;

			const styles = Obj.Entries(Styles);
			for (let index = 0, length = styles.length; index < length; ++index) {
				const [styleName, value] = styles[index];
				const styleValue = value === '{{value}}' ? undefined : value;
				if (DOM.HasStyle(selector, styleName, styleValue)) return true;
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
			if (!current || current === self.GetBody()) break;

			const replacedNodes: Node[] = [];

			const wrapNeedless = (child: Node): Node => {
				const wrapped = DOM.Clone(currentNode);
				DOM.Insert(wrapped, child);
				return wrapped;
			};

			for (let index = 0, length = children.length; index < length; ++index) {
				const child = children[index];
				if (DOM.HasAttr(child, 'marker') || DOM.Element.Figure.Is(child)) {
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
				DOM.RemoveStyles(tempWrapped, ...Obj.Keys(Styles));

				if (Str.IsEmpty(DOM.GetStyleText(tempWrapped))) {
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

		return true;
	};

	const unwrapStyleFormat = (format: IStyleFormat, node: Node): boolean => {
		const { StrictFormats, Styles } = format;

		const closest = getClosestByStyles(node, Styles);
		if (!closest || !StrictFormats.has(DOM.Utils.GetNodeName(closest))) return false;

		DOM.RemoveStyles(closest, ...Obj.Keys(Styles));

		return true;
	};

	const processUnwrap = (format: TFormat, node: Node): boolean => {
		switch (format.Type) {
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

		Arr.Each(formats, (format, exit) => {
			if (processUnwrap(format, node)) return exit();
		});
	};

	return {
		Unwrap,
	};
};

export default FormatUnwrapper;