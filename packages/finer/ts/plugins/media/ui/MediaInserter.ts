import Editor from '../../../packages/Editor';
import { IPluginMediaUI } from '../UI';
import { IPluginsMediaFormatUI } from '../utils/Type';
import { COMMAND_NAMES_MAP } from '../utils/Utils';

const MediaInserter = (editor: Editor, ui: IPluginMediaUI) => {
	const self = editor;
	const DOM = self.DOM;
	const formatter = self.Formatter;
	const formatUI = formatter.UI;

	const uiName = 'Media';
	const uiFormat: IPluginsMediaFormatUI = {
		Title: self.Lang('plugins.media.title', 'Insert/Edit a media'),
		Icon: 'Media'
	};

	const createOptionList = (wrapper: HTMLElement) =>
		(): HTMLElement => {
			const figure = self.Tools.DOM.SelectFocused(false, 'media');
			const figureElement = DOM.Element.Figure.SelectFigureElement<HTMLIFrameElement>(figure);
			const bUpdatable = DOM.Element.Figure.Is(figure) && (DOM.Utils.IsIFrame(figureElement) || DOM.Utils.IsVideo(figureElement));

			const createMedia = (input: HTMLInputElement) => {
				const commandName = !bUpdatable ? COMMAND_NAMES_MAP.MEDIA_CREATE : COMMAND_NAMES_MAP.MEDIA_UPDATE;
				self.Commander.Run<string | Node | null>(commandName, input.value, figureElement);
			};

			const removeMedia = () => {
				if (!figure) return;
				self.Commander.Run(COMMAND_NAMES_MAP.MEDIA_REMOVE, figure);
			};

			const placeholderUpdate = self.Lang('plugins.media.update', 'Update the media URL');
			const placeholderInsert = self.Lang('plugins.media.insert', 'Insert a media via URL');

			const { OptionWrapper, Input } = formatUI.CreateInputWrapWithOptionList(self, {
				uiName,
				bUpdatable,
				createCallback: createMedia,
				removeCallback: removeMedia,
				src: bUpdatable ? figureElement.src : undefined,
				texts: {
					placeholder: bUpdatable ? placeholderUpdate : placeholderInsert,
					cancel: self.Lang('cancel', 'Cancel'),
					insert: self.Lang('insert', 'Insert'),
					update: self.Lang('update', 'Update'),
					remove: self.Lang('remove', 'Remove'),
				}
			});

			DOM.Insert(self.Frame.Root, OptionWrapper);
			formatUI.SetOptionListCoordinate(self, uiName, wrapper, OptionWrapper);
			Input.focus();
			return OptionWrapper;
		};

	const iconWrap = ui.CreateFormatButton(uiFormat);

	DOM.SetAttr(iconWrap.Wrapper, 'no-border');

	formatUI.BindOptionListEvent(self, {
		type: uiName,
		activable: iconWrap.Wrapper,
		clickable: iconWrap.Wrapper,
		create: createOptionList(iconWrap.Wrapper)
	});

	self.Toolbar.Add(uiName, iconWrap.Wrapper);
};

export default MediaInserter;