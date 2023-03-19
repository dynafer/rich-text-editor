import { Arr } from '@dynafer/utils';
import Options from '../../../../Options';
import Editor from '../../../Editor';
import { FigureSelector } from '../../../formatter/Format';
import AdjustableEdge from './AdjustableEdge';
import AdjustableLine from './AdjustableLine';

export interface IImageTools {
	Create: (image: HTMLImageElement) => HTMLElement,
	RemoveAll: (except?: Element | null) => void,
}

const ImageTools = (editor: Editor): IImageTools => {
	const self = editor;
	const DOM = self.DOM;

	const Create = (image: HTMLImageElement): HTMLElement => {
		const tools = DOM.Create('div', {
			attrs: {
				dataType: 'image-tool',
				dataFixed: 'dom-tool',
			},
		});

		const adjustableLine = AdjustableLine(self, image);
		const adjustableEdge = AdjustableEdge(self, image);

		DOM.Insert(tools, adjustableLine, adjustableEdge);

		return tools;
	};

	const RemoveAll = (except?: Element | null) => {
		const toolList = DOM.SelectAll({
			attrs: {
				dataType: 'image-tool'
			}
		}, self.GetBody());

		const focused = DOM.Select({
			attrs: [
				Options.ATTRIBUTE_FOCUSED,
				{ type: 'img' }
			]
		}, self.GetBody());

		const isSkippable = (tools: HTMLElement): boolean =>
			(!!focused && DOM.Utils.IsChildOf(tools, focused) && DOM.Closest(tools, FigureSelector) === focused)
			|| (!!except && DOM.Utils.IsChildOf(tools, except));

		Arr.Each(toolList, tools => {
			if (isSkippable(tools)) return;
			DOM.Remove(tools, true);
		});
	};

	return {
		Create,
		RemoveAll,
	};
};

export default ImageTools;