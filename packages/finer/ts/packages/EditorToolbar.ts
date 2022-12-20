import { Str } from '@dynafer/utils';
import DOM from './dom/DOM';
import Editor from './Editor';

export enum EToolbarStyle {
	SCROLL = 'SCROLL',
	FLOAT = 'FLOAT',
}

export interface IEditorToolbar {
	Has: (name: string) => boolean,
	Get: (name: string) => HTMLElement;
	LoadAll: () => void,
	IsInGroup: (name: string) => boolean,
	Add: (name: string, element: HTMLElement) => void,
	Remove: (name: string) => void,
	RemoveAll: () => void,
}

const EditorToolbar = (editor: Editor): IEditorToolbar => {
	const self = editor;
	const ToolbarSet = self.Config.Toolbar;
	const ToolbarGroup = self.Config.ToolbarGroup;
	const items: Record<string, HTMLElement> = {};

	const Has = (name: string): boolean => !!items[Str.LowerCase(name)];

	const Get = (name: string): HTMLElement => items[Str.LowerCase(name)];

	const createGroup = (name: string): HTMLElement => {
		const group = DOM.Create('div', {
			attrs: {
				group: name
			},
			class: DOM.Utils.CreateUEID('toolbar-group', false)
		});

		for (const groupItem of ToolbarGroup[name]) {
			if (!Has(groupItem)) continue;
			DOM.Insert(group, Get(groupItem));
		}

		return group;
	};

	const addAll = () => {
		for (const toolbar of ToolbarSet) {
			if (Has(toolbar)) {
				DOM.Insert(self.Frame.Toolbar, Get(toolbar));
				continue;
			}

			if (!ToolbarGroup[toolbar]) continue;

			DOM.Insert(self.Frame.Toolbar, createGroup(toolbar));
		}
	};

	const LoadAll = () => {
		for (const toolbar of ToolbarSet) {
			if (self.Formatter.Registry.IsAvailable(toolbar)) {
				self.Formatter.Register(toolbar);
				continue;
			}

			if (!ToolbarGroup[toolbar]) {
				if (self.Plugin.Has(toolbar)) self.Plugin.Get(toolbar)(toolbar);
				continue;
			}

			for (const groupItem of ToolbarGroup[toolbar]) {
				if (self.Formatter.Registry.IsAvailable(groupItem)) {
					self.Formatter.Register(groupItem);
					continue;
				}

				if (!self.Plugin.Has(groupItem)) continue;

				self.Plugin.Get(groupItem)(groupItem);
			}
		}

		addAll();
	};

	const IsInGroup = (name: string): boolean => items[name] && DOM.HasAttr(items[name].parentElement, 'group');

	const Add = (name: string, element: HTMLElement) => {
		if (Has(name)) return;
		items[Str.LowerCase(name)] = element;
	};

	const Remove = (name: string) => {
		if (!Has(name)) return;
		DOM.Remove(items[Str.LowerCase(name)], true);
	};

	const RemoveAll = () => {
		for (const name of Object.keys(items)) {
			Remove(name);
		}
	};

	return {
		Has,
		Get,
		LoadAll,
		IsInGroup,
		Add,
		Remove,
		RemoveAll,
	};
};

export default EditorToolbar;