import { NodeType } from '@dynafer/dom-control';
import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import { IDOMToolsPartAttacher } from './Types';

type TPartPositionListener = (editor: Editor) => void;

export interface IDOMToolsOption<T = unknown> {
	name: string,
	partAttachers: IDOMToolsPartAttacher<T> | IDOMToolsPartAttacher<T>[],
	partPositionListeners?: TPartPositionListener | TPartPositionListener[],
}

export interface IToolsManager {
	IsAttached: (name: string) => boolean,
	Attach: <T = unknown>(opts: IDOMToolsOption<T>) => void,
	Detach: <T = unknown>(opts: IDOMToolsOption<T>) => void,
	Create: (name: string, element: HTMLElement) => HTMLElement,
	SelectTools: <T extends boolean>(bAll: T, parent?: Node) => T extends true ? HTMLElement[] : (HTMLElement | null),
	IsTools: (selector?: Node | EventTarget | null) => boolean,
	ChangePositions: () => void,
}

const ToolsManager = (editor: Editor): IToolsManager => {
	const self = editor;
	const DOM = self.DOM;

	const attachedPartTools: Record<string, IDOMToolsPartAttacher[]> = {};
	const partListeners: TPartPositionListener[] = [];

	const IsAttached = (name: string): boolean => !!attachedPartTools[name];

	const Attach = <T = unknown>(opts: IDOMToolsOption<T>) => {
		const { name, partAttachers, partPositionListeners } = opts;

		if (!attachedPartTools[name]) attachedPartTools[name] = [];
		Arr.Push(attachedPartTools[name], ...(Type.IsArray(partAttachers) ? partAttachers : [partAttachers]));

		if (!partPositionListeners) return;
		Arr.Push(partListeners, ...(Type.IsArray(partPositionListeners) ? partPositionListeners : [partPositionListeners]));
	};

	const Detach = <T = unknown>(opts: IDOMToolsOption<T>) => {
		const { name, partAttachers, partPositionListeners } = opts;

		if (IsAttached(name)) {
			const attachers = Type.IsArray(partAttachers) ? [...partAttachers] : [partAttachers];

			Arr.WhileShift(attachers, attacher => Arr.FindAndRemove(attachedPartTools[name], attacher));
		}

		if (!partPositionListeners) return;
		const listeners = Type.IsArray(partPositionListeners) ? [...partPositionListeners] : [partPositionListeners];

		Arr.WhileShift(listeners, listener => Arr.FindAndRemove(partListeners, listener));
	};

	const Create = (name: string, element: HTMLElement): HTMLElement => {
		const tools = DOM.Create('div', {
			attrs: {
				dataType: `${name}-tool`,
				dataFixed: 'dom-tool',
			},
		});

		const parts: HTMLElement[] = [];
		if (attachedPartTools[name]) Arr.Each(attachedPartTools[name], create => Arr.Push(parts, create(self, element)));

		DOM.Insert(tools, ...parts);

		return tools;
	};

	const SelectTools = <T extends boolean>(bAll: T, parent?: Node): T extends true ? HTMLElement[] : (HTMLElement | null) => {
		const selectOption = { attrs: { dataFixed: 'dom-tool' } };

		if (!bAll && !!parent) {
			const allTools = DOM.SelectAll(selectOption, parent);
			const figure = DOM.Element.Figure.IsFigure(parent)
				? parent
				: (DOM.Element.Figure.GetClosest(parent) ?? DOM.Select(DOM.Element.Figure.Selector, parent));

			if (!figure) return null as T extends true ? HTMLElement[] : (HTMLElement | null);

			for (let index = 0, length = allTools.length; index < length; ++index) {
				const tools = allTools[index];
				if (DOM.Element.Figure.GetClosest(tools) !== figure || !DOM.Utils.IsChildOf(tools, figure)) continue;
				return tools as T extends true ? HTMLElement[] : (HTMLElement | null);
			}
		}

		const select = bAll ? DOM.SelectAll : DOM.Select;

		return select(selectOption, parent) as T extends true ? HTMLElement[] : (HTMLElement | null);
	};

	const IsTools = (selector?: Node | EventTarget | null): boolean =>
		!NodeType.IsNode(selector) ? false : DOM.HasAttr(selector, 'data-fixed', 'dom-tool');

	const ChangePositions = () => Arr.Each(partListeners, listener => listener(self));

	return {
		IsAttached,
		Attach,
		Detach,
		Create,
		SelectTools,
		IsTools,
		ChangePositions,
	};
};

export default ToolsManager;