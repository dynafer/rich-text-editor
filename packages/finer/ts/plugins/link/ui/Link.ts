import Editor from '../../../packages/Editor';
import Toggler from '../format/Toggler';

const Link = (editor: Editor) => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const CaretUtils = self.Utils.Caret;
	const formatter = self.Formatter;
	const formats = formatter.Formats;
	const Detector = formatter.Detector;

	const uiName = 'Link';
	const uiFormat = {
		Title: Finer.ILC.Get('plugins.link.title') ?? 'Insert/Edit a link',
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

	const createOptionList = () => {
		const caret = CaretUtils.Get();
		const anchor = !caret
			? null
			: (DOM.Closest(formatter.Utils.GetParentIfText(caret.Start.Node), 'a')
				?? DOM.Closest(formatter.Utils.GetParentIfText(caret.End.Node), 'a'));

		const bUpdatable = DOM.Utils.IsAnchor(anchor);

		const createAnchor = (input: HTMLInputElement) => formatter.UI.RunCommand<boolean | string>(self, uiFormat.CommandName, true, input?.value);
		const removeAnchor = () => formatter.UI.RunCommand(self, uiFormat.CommandName, false);

		const placeholderUpdate = Finer.ILC.Get('plugins.link.update') ?? 'Update the link';
		const placeholderInsert = Finer.ILC.Get('plugins.link.insert') ?? 'Insert a link';

		const { OptionWrapper, Input } = formatter.UI.CreateInputWrapWithOptionList({
			uiName,
			bUpdatable,
			createCallback: createAnchor,
			removeCallback: removeAnchor,
			src: bUpdatable ? anchor.href : undefined,
			texts: {
				placeholder: bUpdatable ? placeholderUpdate : placeholderInsert,
				cancel: Finer.ILC.Get('cancel') ?? 'Cancel',
				insert: Finer.ILC.Get('insert') ?? 'Insert',
				update: Finer.ILC.Get('update') ?? 'Update',
				remove: Finer.ILC.Get('remove') ?? 'Remove',
			}
		});

		DOM.Insert(self.Frame.Root, OptionWrapper);
		formatter.UI.SetOptionListCoordinate(self, uiName, iconButton, OptionWrapper);
		Input.focus();
	};

	const command = (bWrap: boolean, url: string) => {
		if (formatter.UI.IsDisabled(iconButton)) return;
		const toggler = Toggler(self);

		toggler.ToggleFromCaret(bWrap, url);
		formatter.UI.ToggleActivateClass(iconButton, bWrap);
	};

	formatter.UI.RegisterCommand(self, uiFormat.CommandName, command);

	formatter.UI.BindOptionListEvent(self, uiName, iconButton, iconButton, createOptionList);

	Detector.Register((paths: Node[]) => {
		formatter.UI.ToggleActivateClass(iconButton, isDetected(paths));

		const { Figure, FigureElement } = DOM.Element.Figure.Find(paths[0]);
		const bDisable = !!Figure && !!FigureElement && formats.AllDisableList.has(DOM.Utils.GetNodeName(FigureElement));
		formatter.UI.ToggleDisable(iconButton, bDisable);
	});

	self.Toolbar.Add(uiName, iconButton);
};

export default Link;