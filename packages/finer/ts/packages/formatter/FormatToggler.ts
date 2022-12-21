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

	const processRecursive = (bWrap: boolean, formats: TFormat | TFormat[], node: Node, toggleOption: IToggleRecursiveOption = {}) => {
		const { except, endNode, value } = toggleOption;
		for (const child of DOM.GetChildNodes(node, false)) {
			if (Arr.Contains(except ?? [], child)) continue;
			if (!DOM.Utils.IsText(child)) {
				processRecursive(bWrap, formats, child, toggleOption);
				if (endNode && DOM.Utils.IsChildOf(endNode, child)) return;
				continue;
			}

			process(bWrap, formats, child, value);
			if (endNode && child === endNode) return;
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