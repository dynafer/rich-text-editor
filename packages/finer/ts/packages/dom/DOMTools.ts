import { Arr } from '@dynafer/utils';
import Options from '../../Options';
import Editor from '../Editor';
import DefaultParts from './tools/DefaultParts';
import ToolsManager, { IToolsManager } from './tools/ToolsManager';
import { ChangeAllPositions } from './tools/Utils';

export interface IDOMTools {
	Manager: IToolsManager,
	Create: (type: string, element: HTMLElement) => HTMLElement | null,
	RemoveAll: () => void,
	Show: (target?: HTMLElement) => void,
	HideAll: (except?: Element | null) => void,
	ChangePositions: () => void,
}

const DOMTools = (editor: Editor): IDOMTools => {
	const self = editor;
	const DOM = self.DOM;
	const Manager = ToolsManager(self);

	// Register image tools
	Manager.Attach(DefaultParts.Image);

	// Register table tools
	Manager.Attach(DefaultParts.Table);

	const selectFocused = (): HTMLElement => DOM.Select<HTMLElement>({
		attrs: [
			Options.ATTRIBUTE_FOCUSED,
		]
	}, self.GetBody());

	const Create = (type: string, element: HTMLElement): HTMLElement | null =>
		Manager.Create(type, element);

	const RemoveAll = () => {
		const toolList = DOM.SelectAll({
			attrs: {
				dataFixed: 'dom-tool'
			}
		}, self.GetBody());

		Arr.Each(toolList, tools => DOM.Remove(tools, true));
	};

	const Show = (target?: HTMLElement | null) =>
		DOM.Show(target ?? selectFocused());

	const HideAll = (except?: Element | null) => {
		const toolList = DOM.SelectAll({
			attrs: {
				dataFixed: 'dom-tool'
			}
		}, self.GetBody());

		const focused = selectFocused();

		const isSkippable = (tools: HTMLElement): boolean =>
			(!!focused && DOM.Utils.IsChildOf(tools, focused) && DOM.Element.Figure.GetClosest(tools) === focused)
			|| (!!except && DOM.Utils.IsChildOf(tools, except));

		Arr.Each(toolList, tools => {
			if (isSkippable(tools)) return;
			DOM.Hide(tools);
		});
	};

	const ChangePositions = () => {
		Show();
		ChangeAllPositions(self);
		Manager.ChangePositions();
	};

	return {
		Manager,
		Create,
		RemoveAll,
		Show,
		HideAll,
		ChangePositions,
	};
};

export default DOMTools;