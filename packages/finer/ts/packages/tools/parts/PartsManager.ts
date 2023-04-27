import { NodeType } from '@dynafer/dom-control';
import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import { IPartsToolAttacher } from '../types/PartsType';

type TPartPositionListener = (editor: Editor) => void;

export interface IPartsToolOption<T = unknown> {
	name: string,
	partAttachers: IPartsToolAttacher<T> | IPartsToolAttacher<T>[],
	partPositionListeners?: TPartPositionListener | TPartPositionListener[],
}

export interface IPartsManager {
	IsAttached: (name: string) => boolean,
	Attach: <T = unknown>(opts: IPartsToolOption<T>) => void,
	Detach: <T = unknown>(opts: IPartsToolOption<T>) => void,
	Create: (name: string, element: HTMLElement) => HTMLElement,
	SelectParts: <T extends boolean>(bAll: T, parent?: Node) => T extends true ? HTMLElement[] : (HTMLElement | null),
	IsParts: (selector?: Node | EventTarget | null) => boolean,
	ChangePositions: () => void,
}

const PartsManager = (editor: Editor): IPartsManager => {
	const self = editor;
	const DOM = self.DOM;

	const attachedPartTools: Record<string, IPartsToolAttacher[]> = {};
	const partListeners: TPartPositionListener[] = [];

	const IsAttached = (name: string): boolean => !!attachedPartTools[name];

	const Attach = <T = unknown>(opts: IPartsToolOption<T>) => {
		const { name, partAttachers, partPositionListeners } = opts;

		if (!attachedPartTools[name]) attachedPartTools[name] = [];
		Arr.Push(attachedPartTools[name], ...(Type.IsArray(partAttachers) ? partAttachers : [partAttachers]));

		if (!partPositionListeners) return;
		Arr.Push(partListeners, ...(Type.IsArray(partPositionListeners) ? partPositionListeners : [partPositionListeners]));
	};

	const Detach = <T = unknown>(opts: IPartsToolOption<T>) => {
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
		const parts = DOM.Create('div', {
			attrs: {
				dataType: `${name}-tool`,
				dataFixed: 'parts-tool',
			},
		});

		const partList: HTMLElement[] = [];
		if (attachedPartTools[name]) Arr.Each(attachedPartTools[name], create => Arr.Push(partList, create(self, element)));

		DOM.Insert(parts, ...partList);

		return parts;
	};

	const SelectParts = <T extends boolean>(bAll: T, parent?: Node): T extends true ? HTMLElement[] : (HTMLElement | null) => {
		const selectOption = { attrs: { dataFixed: 'parts-tool' } };

		if (!bAll && !!parent) {
			const allParts = DOM.SelectAll(selectOption, parent);
			const figure = DOM.Element.Figure.Is(parent)
				? parent
				: (DOM.Element.Figure.FindClosest(parent) ?? DOM.Select(DOM.Element.Figure.Selector, parent));

			if (!figure) return null as T extends true ? HTMLElement[] : (HTMLElement | null);

			for (let index = 0, length = allParts.length; index < length; ++index) {
				const parts = allParts[index];
				if (DOM.Element.Figure.FindClosest(parts) !== figure || !DOM.Utils.IsChildOf(parts, figure)) continue;
				return parts as T extends true ? HTMLElement[] : (HTMLElement | null);
			}
		}

		const select = bAll ? DOM.SelectAll : DOM.Select;

		return select(selectOption, parent) as T extends true ? HTMLElement[] : (HTMLElement | null);
	};

	const IsParts = (selector?: Node | EventTarget | null): boolean =>
		!NodeType.IsNode(selector) ? false : DOM.HasAttr(selector, 'data-fixed', 'parts-tool');

	const ChangePositions = () => Arr.Each(partListeners, listener => listener(self));

	return {
		IsAttached,
		Attach,
		Detach,
		Create,
		SelectParts,
		IsParts,
		ChangePositions,
	};
};

export default PartsManager;