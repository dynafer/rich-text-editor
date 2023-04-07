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
		Icon: 'Hyperlink'
	};

	const isDetected = (nodes: Node[]): boolean => {
		for (let index = 0, length = nodes.length; index < length; ++index) {
			const node = nodes[index];
			if (!DOM.Closest(node, 'a')) continue;

			return true;
		}
		return false;
	};

	const createOptionList = (wrapper: HTMLElement) =>
		() => {
			const caret = CaretUtils.Get();
			const anchor = !caret
				? null
				: (DOM.Closest(formatter.Utils.GetParentIfText(caret.Start.Node), 'a')
					?? DOM.Closest(formatter.Utils.GetParentIfText(caret.End.Node), 'a'));

			const bUpdatable = DOM.Utils.IsAnchor(anchor);

			const createCallback = (bWrap: boolean) =>
				(input: HTMLInputElement) => {
					const toggler = Toggler(self);

					toggler.ToggleFromCaret(bWrap, input?.value);
					formatter.UI.ToggleActivateClass(wrapper, bWrap);
				};

			const createAnchor = createCallback(true);
			const removeAnchor = createCallback(false);

			const placeholderUpdate = Finer.ILC.Get('plugins.link.update') ?? 'Update the link';
			const placeholderInsert = Finer.ILC.Get('plugins.link.insert') ?? 'Insert a link';

			const { OptionWrapper, Input } = formatter.UI.CreateInputWrapWithOptionList({
				uiName,
				bUpdatable,
				createCallback: createAnchor,
				removeCallback: removeAnchor as () => void,
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
			formatter.UI.SetOptionListCoordinate(self, uiName, wrapper, OptionWrapper);
			Input.focus();
		};

	const iconButton = formatter.UI.CreateIconButton(uiFormat.Title, uiFormat.Icon);

	formatter.UI.BindOptionListEvent(self, uiName, iconButton, iconButton, createOptionList(iconButton));

	Detector.Register((paths: Node[]) => {
		formatter.UI.ToggleActivateClass(iconButton, isDetected(paths));

		const figure = DOM.Element.Figure.GetClosest(paths[0]);
		const bDisable = !!figure && formats.BlockFormatTags.Figures.has(DOM.GetAttr(figure, 'type') ?? '');
		formatter.UI.ToggleDisable(iconButton, bDisable);
	});

	self.Toolbar.Add(uiName, iconButton);
};

export default Link;