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

			let currentAttacher;
			while (!Arr.IsEmpty(attachers)) {
				currentAttacher = Arr.Shift(attachers);
				if (!currentAttacher) continue;

				Arr.Remove(attachedPartTools[name], currentAttacher);
			}
		}

		if (!partPositionListeners) return;
		const listeners = Type.IsArray(partPositionListeners) ? [...partPositionListeners] : [partPositionListeners];

		let currentListeners;
		while (!Arr.IsEmpty(listeners)) {
			currentListeners = Arr.Shift(listeners);
			if (!currentListeners) continue;

			Arr.Remove(partListeners, currentListeners);
		}
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

	const ChangePositions = () => Arr.Each(partListeners, listener => listener(self));

	return {
		IsAttached,
		Attach,
		Detach,
		Create,
		ChangePositions,
	};
};

export default ToolsManager;