import Editor from '../../../packages/Editor';
import Media from '../format/Media';
import { IPluginMediaUI } from '../UI';
import { IPluginsMediaFormatUI } from '../utils/Type';
import URLMatcher from '../utils/URLMatcher';

const MediaInserter = (editor: Editor, ui: IPluginMediaUI) => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatter = self.Formatter;
	const formatUI = formatter.UI;

	const uiName = 'Media';
	const uiFormat: IPluginsMediaFormatUI = {
		Title: Finer.ILC.Get('plugins.media.title') ?? 'Insert/Edit a media',
		Icon: 'Media'
	};

	const createOptionList = (wrapper: HTMLElement) =>
		() => {
			const figure = self.Tools.DOM.SelectFocused(false, 'media');
			const figureElement = DOM.Element.Figure.SelectFigureElement<HTMLIFrameElement>(figure);
			const bUpdatable = DOM.Element.Figure.IsFigure(figure) && (DOM.Utils.IsIFrame(figureElement) || DOM.Utils.IsVideo(figureElement));

			const createMedia = (input: HTMLInputElement) => {
				const mediaFormat = Media(self);

				const matchedURL = URLMatcher.Match(input.value);
				const format = matchedURL.Format ?? 'video';
				const width = matchedURL.Width ?? 640;
				const height = matchedURL.Height ?? 360;

				const loadCallback = (media: HTMLElement) => {
					if (DOM.Utils.IsVideo(media)) {
						media.controls = true;
						return;
					}

					DOM.SetAttrs(media, {
						dataOriginalWidth: width.toString(),
						dataOriginalHeight: height.toString(),
					});
					self.DOM.SetStyles(media, {
						width: `${width}px`,
						height: `${height}px`,
					});
				};

				if (!bUpdatable) return mediaFormat.CreateViaURL(matchedURL.URL, {
					tagName: format,
					loadCallback
				});

				if (DOM.Utils.GetNodeName(figureElement) === format) {
					figureElement.src = matchedURL.URL;
					return mediaFormat.OnLoadAndErrorEvents(figureElement, loadCallback);
				}

				mediaFormat.ChangeFigure(figure, {
					tagName: format,
					attrs: {
						src: matchedURL.URL
					},
					loadCallback
				});
			};

			const removeMedia = () => {
				if (!figure) return;
				DOM.Remove(figure);
			};

			const placeholderUpdate = Finer.ILC.Get('plugins.media.update') ?? 'Update the media URL';
			const placeholderInsert = Finer.ILC.Get('plugins.media.insert') ?? 'Insert a media via URL';

			const { OptionWrapper, Input } = formatUI.CreateInputWrapWithOptionList({
				uiName,
				bUpdatable,
				createCallback: createMedia,
				removeCallback: removeMedia,
				src: bUpdatable ? figureElement.src : undefined,
				texts: {
					placeholder: bUpdatable ? placeholderUpdate : placeholderInsert,
					cancel: Finer.ILC.Get('cancel') ?? 'Cancel',
					insert: Finer.ILC.Get('insert') ?? 'Insert',
					update: Finer.ILC.Get('update') ?? 'Update',
					remove: Finer.ILC.Get('remove') ?? 'Remove',
				}
			});

			DOM.Insert(self.Frame.Root, OptionWrapper);
			formatUI.SetOptionListCoordinate(self, uiName, wrapper, OptionWrapper);
			Input.focus();
		};

	const iconWrap = ui.CreateFormatButton(uiFormat);

	DOM.SetAttr(iconWrap.Button, 'no-border');

	formatUI.BindOptionListEvent(self, uiName, iconWrap.Wrapper, iconWrap.Wrapper, createOptionList(iconWrap.Wrapper));

	self.Toolbar.Add(uiName, iconWrap.Wrapper);
};

export default MediaInserter;