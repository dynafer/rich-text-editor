import { Arr, Type } from '@dynafer/utils';
import Options from '../../Options';
import Editor from '../Editor';
import DefaultParts from './tools/DefaultParts';
import ToolsManager, { IToolsManager } from './tools/ToolsManager';
import { ChangeAllPositions } from './tools/Utils';

export interface IDOMTools {
	readonly Manager: IToolsManager,
	Create: (type: string, element: HTMLElement) => HTMLElement | null,
	RemoveAll: () => void,
	SelectFocused: <T extends boolean = false>(bAll?: T | false, type?: string) => T extends false ? (HTMLElement | null) : HTMLElement[],
	Show: (target?: HTMLElement) => void,
	HideAll: (except?: Element | null) => void,
	UnsetAllFocused: (except?: Element | null) => void,
	ChangePositions: () => void,
}

const DOMTools = (editor: Editor): IDOMTools => {
	const self = editor;
	const DOM = self.DOM;
	const Manager = ToolsManager(self);

	// Register default tools
	Manager.Attach(DefaultParts.Media);
	Manager.Attach(DefaultParts.Table);

	const Create = (type: string, element: HTMLElement): HTMLElement | null =>
		Manager.Create(type, element);

	const RemoveAll = () => {
		const toolList = Manager.SelectTools(true);

		Arr.Each(toolList, tools => DOM.Remove(tools, true));
	};

	const SelectFocused = <T extends boolean = false>(bAll: T | false = false, type?: string): T extends false ? (HTMLElement | null) : HTMLElement[] => {
		const select = !bAll ? DOM.Select<HTMLElement> : DOM.SelectAll<HTMLElement>;
		const attrs: (string | Record<string, string>)[] = [Options.ATTRIBUTE_FOCUSED];
		if (Type.IsString(type)) Arr.Push(attrs, { type });
		return select({ attrs }) as T extends false ? (HTMLElement | null) : HTMLElement[];
	};

	const Show = (target?: HTMLElement | null) => {
		if (target) return DOM.Show(target);
		const focused = SelectFocused();
		if (!focused) return;
		DOM.Show(target ?? Manager.SelectTools(false, focused));
	};

	const HideAll = (except?: Element | null) => {
		const toolList = Manager.SelectTools(true);

		const focused = SelectFocused();

		const isSkippable = (tools: HTMLElement): boolean =>
			(!!focused && DOM.Utils.IsChildOf(tools, focused) && DOM.Element.Figure.GetClosest(tools) === focused)
			|| (!!except && DOM.Utils.IsChildOf(tools, except) && DOM.Element.Figure.GetClosest(tools) === focused);

		Arr.Each(toolList, tools => {
			if (isSkippable(tools)) return;
			DOM.Hide(tools);
		});
	};

	const UnsetAllFocused = (except?: Element | null) => {
		const focusedFigures = SelectFocused(true);

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
		SelectFocused,
		Show,
		HideAll,
		UnsetAllFocused,
		ChangePositions,
	};
};

export default DOMTools;