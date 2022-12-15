import DOM from './dom/DOM';
import Editor from './Editor';

export enum EToolbarStyle {
	SCROLL = 'SCROLL',
	FLOAT = 'FLOAT',
}

export interface IEditorToolbar {
	Has: (name: string) => boolean,
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

	const Has = (name: string): boolean => !!items[name];

	const createGroup = (name: string): HTMLElement => {
		const group = DOM.Create('div', {
			attrs: {
				group: name
			},
			class: DOM.Utils.CreateUEID('toolbar-group', false)
		});

		for (const groupItem of ToolbarGroup[name]) {
			if (!items[groupItem]) continue;
			DOM.Insert(group, items[groupItem]);
		}

		return group;
	};

	const addAll = () => {
		for (const toolbar of ToolbarSet) {
			if (items[toolbar]) {
				DOM.Insert(self.Frame.Toolbar, items[toolbar]);
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

			if (!ToolbarGroup[toolbar]) continue;

			for (const groupItem of ToolbarGroup[toolbar]) {
				self.Formatter.Register(groupItem);
			}
		}

		addAll();
	};

	const IsInGroup = (name: string): boolean => items[name] && DOM.HasAttr(items[name].parentElement, 'group');

	const Add = (name: string, element: HTMLElement) => {
		if (Has(name)) return;
		items[name] = element;
	};

	const Remove = (name: string) => {
		if (!Has(name)) return;
		DOM.Remove(items[name], true);
	};

	const RemoveAll = () => {
		for (const name of Object.keys(items)) {
			Remove(name);
		}
	};

	return {
		Has,
		LoadAll,
		IsInGroup,
		Add,
		Remove,
		RemoveAll,
	};
};

export default EditorToolbar;