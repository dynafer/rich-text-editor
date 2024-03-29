import Editor from '../../../packages/Editor';
import Toggler from '../format/Toggler';

const Link = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const formatter = self.Formatter;
	const formats = formatter.Formats;
	const Detector = formatter.Detector;

	const uiName = 'Link';
	const uiFormat = {
		Title: self.Lang('plugins.link.title', 'Insert/Edit a link'),
		CommandName: 'Hyperlink',
		Icon: 'Hyperlink'
	};

	const iconButton = formatter.UI.CreateIconButton(uiFormat.Title, uiFormat.Icon);

	const isDetected = (nodes: Node[]): boolean => {
		for (let index = 0, length = nodes.length; index < length; ++index) {
			const node = nodes[index];
			if (!DOM.Closest(node, 'a')) continue;

			return true;
		}
		return false;
	};

	const createOptionList = (): HTMLElement => {
		const caret = CaretUtils.Get();
		const anchor = !caret
			? null
			: (DOM.Closest(formatter.Utils.GetParentIfText(caret.Start.Node), 'a')
				?? DOM.Closest(formatter.Utils.GetParentIfText(caret.End.Node), 'a'));

		const bUpdatable = DOM.Utils.IsAnchor(anchor);

		const createAnchor = (input: HTMLInputElement) => formatter.UI.RunCommand<boolean | string>(self, uiFormat.CommandName, true, input?.value);
		const removeAnchor = () => formatter.UI.RunCommand(self, uiFormat.CommandName, false);

		const placeholderUpdate = self.Lang('plugins.link.update', 'Update the link');
		const placeholderInsert = self.Lang('plugins.link.insert', 'Insert a link');

		const { OptionWrapper, Input } = formatter.UI.CreateInputWrapWithOptionList(self, {
			uiName,
			bUpdatable,
			createCallback: createAnchor,
			removeCallback: removeAnchor,
			src: bUpdatable ? anchor.href : undefined,
			texts: {
				placeholder: bUpdatable ? placeholderUpdate : placeholderInsert,
				cancel: self.Lang('cancel', 'Cancel'),
				insert: self.Lang('insert', 'Insert'),
				update: self.Lang('update', 'Update'),
				remove: self.Lang('remove', 'Remove'),
			}
		});

		DOM.Insert(self.Frame.Root, OptionWrapper);
		formatter.UI.SetOptionListCoordinate(self, uiName, iconButton, OptionWrapper);
		Input.focus();
		return OptionWrapper;
	};

	const command = (bWrap: boolean, url: string) => {
		if (formatter.UI.IsDisabled(iconButton)) return;
		const toggler = Toggler(self);

		toggler.ToggleFromCaret(bWrap, url);
		formatter.UI.ToggleActivateClass(iconButton, bWrap);
	};

	formatter.UI.RegisterCommand(self, uiFormat.CommandName, command);

	formatter.UI.BindOptionListEvent(self, {
		type: uiName,
		activable: iconButton,
		clickable: iconButton,
		create: createOptionList
	});

	Detector.Register((paths: Node[]) => {
		formatter.UI.ToggleActivateClass(iconButton, isDetected(paths));

		const { Figure, FigureElement } = DOM.Element.Figure.Find(paths[0]);
		const bDisable = !!Figure && !!FigureElement && formats.AllDisableList.has(DOM.Utils.GetNodeName(FigureElement));
		formatter.UI.ToggleDisable(iconButton, bDisable);
	});

	self.Toolbar.Add(uiName, iconButton);
};

export default Link;