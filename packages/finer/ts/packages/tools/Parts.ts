import { Arr, Type } from '@dynafer/utils';
import Options from '../../Options';
import Editor from '../Editor';
import DefaultParts from './parts/DefaultParts';
import PartsManager, { IPartsManager } from './parts/PartsManager';
import { ADDABLE_TOOLS_MENU_TOP, ChangeAllPositions, ChangePartsMenuOptionList } from './parts/Utils';

export interface IPartsTool {
	readonly Manager: IPartsManager,
	Create: (type: string, element: HTMLElement) => HTMLElement | null,
	RemoveAll: () => void,
	SelectFocused: <T extends boolean = false>(bAll?: T | false, type?: string) => T extends false ? (HTMLElement | null) : HTMLElement[],
	Show: (target?: HTMLElement) => void,
	HideAll: (except?: Element | null) => void,
	UnsetAllFocused: (except?: Element | null) => void,
	ChangePositions: () => void,
}

const PartsTool = (editor: Editor): IPartsTool => {
	const self = editor;
	const DOM = self.DOM;
	const Manager = PartsManager(self);

	// Register default parts
	Manager.Attach(DefaultParts.Media);
	Manager.Attach(DefaultParts.Table);

	DOM.On(self.GetWin(), Finer.NativeEventMap.scroll, () =>
		Arr.Each(DOM.SelectAll<HTMLElement>({ attrs: [Options.ATTRIBUTES.PARTS_MENU] }), menu => {
			const { Figure, FigureElement } = DOM.Element.Figure.Find<HTMLElement>(menu);
			if (!Figure || !FigureElement) return;

			const yRange = self.GetWin().innerHeight + self.GetWin().scrollY;
			const predictMenuBottomSide = Figure.offsetTop + Figure.offsetHeight + menu.offsetHeight;

			const position = predictMenuBottomSide <= yRange
				? `${FigureElement.offsetTop + FigureElement.offsetHeight + ADDABLE_TOOLS_MENU_TOP}px`
				: `${FigureElement.offsetTop - menu.offsetHeight - ADDABLE_TOOLS_MENU_TOP}px`;

			DOM.SetStyle(menu, 'top', position);

			ChangePartsMenuOptionList(self, menu);
		})
	);

	const Create = (type: string, element: HTMLElement): HTMLElement | null =>
		Manager.Create(type, element);

	const RemoveAll = () => {
		const partsList = Manager.SelectParts(true);

		Arr.Each(partsList, parts => DOM.Remove(parts, true));
	};

	const SelectFocused = <T extends boolean = false>(bAll: T | false = false, type?: string): T extends false ? (HTMLElement | null) : HTMLElement[] => {
		const select = !bAll ? DOM.Select<HTMLElement> : DOM.SelectAll<HTMLElement>;
		const attrs: (string | Record<string, string>)[] = [Options.ATTRIBUTES.FOCUSED];
		if (Type.IsString(type)) Arr.Push(attrs, { type });
		return select({ tagName: DOM.Element.Figure.Selector, attrs }) as T extends false ? (HTMLElement | null) : HTMLElement[];
	};

	const Show = (target?: HTMLElement | null) => {
		if (target) return DOM.Show(target);
		const focused = SelectFocused();
		if (!focused) return;
		DOM.Show(target ?? Manager.SelectParts(false, focused));
	};

	const HideAll = (except?: Element | null) => {
		const toolList = Manager.SelectParts(true);

		const focused = SelectFocused();

		const isSkippable = (parts: HTMLElement): boolean =>
			(!!focused && DOM.Utils.IsChildOf(parts, focused) && DOM.Element.Figure.FindClosest(parts) === focused)
			|| (!!except && DOM.Utils.IsChildOf(parts, except) && DOM.Element.Figure.FindClosest(parts) === focused);

		Arr.Each(toolList, parts => {
			if (isSkippable(parts)) return;
			DOM.Hide(parts);
		});
	};

	const UnsetAllFocused = (except?: Element | null) => {
		const focusedFigures = SelectFocused(true);

		Arr.Each(focusedFigures, focused => {
			if (!!except && focused === except) return;
			DOM.RemoveAttr(focused, Options.ATTRIBUTES.FOCUSED);
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

export default PartsTool;