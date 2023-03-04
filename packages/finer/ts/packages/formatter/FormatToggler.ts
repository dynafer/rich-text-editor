import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { IToggleRecursiveOption, TFormat } from './FormatType';
import FormatUnwrapper from './FormatUnwrapper';
import FormatUtils from './FormatUtils';
import FormatWrapper from './FormatWrapper';

export interface IFormatToggler {
	Toggle: (bWrap: boolean, formats: TFormat | TFormat[], node: Node, value?: string) => void;
	ToggleRecursive: (bWrap: boolean, formats: TFormat | TFormat[], node: Node, toggleOption?: IToggleRecursiveOption) => void;
}

const FormatToggler = (editor: Editor): IFormatToggler => {
	const self = editor;
	const DOM = self.DOM;
	const Wrapper = FormatWrapper(self);
	const Unwrapper = FormatUnwrapper(self);

	const process = (bWrap: boolean, formats: TFormat | TFormat[], node: Node, value?: string) => {
		const toggle = bWrap ? Wrapper.Wrap : Unwrapper.Unwrap;
		toggle(formats, node, value);
	};

	const trimEndBr = (node: Node | null): boolean => {
		const bBr = DOM.Utils.IsBr(node);

		if (!bBr) return false;

		node.remove();
		return true;
	};

	const processRecursive = (bWrap: boolean, formats: TFormat | TFormat[], node: Node, toggleOption: IToggleRecursiveOption = {}) => {
		const { except, endNode, value, bInline } = toggleOption;
		const children = DOM.GetChildNodes(node, bInline);
		for (const child of children) {
			if (Arr.Contains(except ?? [], child)) continue;

			let childNextSibling = child.nextSibling;
			let endNodeNextSibling = endNode?.nextSibling ?? null;
			if (childNextSibling && DOM.HasAttr(childNextSibling, 'marker')) childNextSibling = childNextSibling.nextSibling;
			if (endNodeNextSibling && DOM.HasAttr(endNodeNextSibling, 'marker')) endNodeNextSibling = endNodeNextSibling.nextSibling;

			if (DOM.Utils.IsText(child) || (children.length === 1 && DOM.Utils.IsBr(child))) {
				process(bWrap, formats, child, value);
				if (endNode && child === endNode) {
					const bRemovedFromChild = trimEndBr(childNextSibling);
					if (bRemovedFromChild) return;

					trimEndBr(endNodeNextSibling);
					return;
				}
			}

			if (DOM.Utils.IsBr(child) && !bInline) {
				child.remove();
			} else {
				processRecursive(bWrap, formats, child, toggleOption);
			}

			if (endNode && ((!bInline && DOM.Utils.IsChildOf(endNode, child)) || (bInline && child === endNode))) {
				const bRemovedFromChild = trimEndBr(childNextSibling);
				if (bRemovedFromChild) return;

				trimEndBr(endNodeNextSibling);
				return;
			}
		}
	};

	const Toggle = (bWrap: boolean, formats: TFormat | TFormat[], node: Node, value?: string) =>
		FormatUtils.RunFormatting(self, () => process(bWrap, formats, node, value));

	const ToggleRecursive = (bWrap: boolean, formats: TFormat | TFormat[], node: Node, toggleOption: IToggleRecursiveOption = {}) =>
		FormatUtils.RunFormatting(self, () => processRecursive(bWrap, formats, node, toggleOption));

	return {
		Toggle,
		ToggleRecursive,
	};
};

export default FormatToggler;