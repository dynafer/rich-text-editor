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
	UnsetAllFocused: (except?: Element | null) => void,
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

	const selectFocused = (): HTMLElement | null => DOM.Select<HTMLElement>({
		attrs: [
			Options.ATTRIBUTE_FOCUSED,
		]
	}, self.GetBody());

	const Create = (type: string, element: HTMLElement): HTMLElement | null =>
		Manager.Create(type, element);

	const RemoveAll = () => {
		const toolList = Manager.SelectTools(true);

		Arr.Each(toolList, tools => DOM.Remove(tools, true));
	};

	const Show = (target?: HTMLElement | null) => {
		if (target) return DOM.Show(target);
		const focused = selectFocused();
		if (!focused) return;
		DOM.Show(target ?? Manager.SelectTools(false, focused));
	};

	const HideAll = (except?: Element | null) => {
		const toolList = Manager.SelectTools(true);

		const focused = selectFocused();

		const isSkippable = (tools: HTMLElement): boolean =>
			(!!focused && DOM.Utils.IsChildOf(tools, focused) && DOM.Element.Figure.GetClosest(tools) === focused)
			|| (!!except && DOM.Utils.IsChildOf(tools, except) && DOM.Element.Figure.GetClosest(tools) === focused);

		Arr.Each(toolList, tools => {
			if (isSkippable(tools)) return;
			DOM.Hide(tools);
		});
	};

	const UnsetAllFocused = (except?: Element | null) => {
		const focusedFigures = DOM.SelectAll({
			attrs: [Finer.Options.ATTRIBUTE_FOCUSED]
		}, self.GetBody());

		Arr.Each(focusedFigures, focused => {
			if (!!except && focused === except) return;
			DOM.RemoveAttr(focused, Options.ATTRIBUTE_FOCUSED);
		});

		HideAll(except);
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
		UnsetAllFocused,
		ChangePositions,
	};
};

export default DOMTools;