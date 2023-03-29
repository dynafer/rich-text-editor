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
		Title: 'Insert a media',
		Icon: 'Media'
	};

	const createOptionList = (wrapper: HTMLElement) =>
		() => {
			const figure = self.Tools.DOM.SelectFocused(false, 'media');
			const figureElement = DOM.Element.Figure.SelectFigureElement<HTMLIFrameElement>(figure);
			const bUpdatable = DOM.Element.Figure.IsFigure(figure) && (DOM.Utils.IsIFrame(figureElement) || DOM.Utils.IsVideo(figureElement));

			const createVideo = (input: HTMLInputElement) => {
				const mediaFormat = Media(self);

				const matchedURL = URLMatcher.Match(input.value);
				const format = matchedURL.format ?? 'video';
				const width = matchedURL.width ?? 640;
				const height = matchedURL.height ?? 360;

				const loadCallback = (media: HTMLElement) => {
					if (DOM.Utils.IsVideo(media)) {
						media.controls = true;
						return;
					}

					self.DOM.SetAttrs(media, {
						dataOriginalWidth: width.toString(),
						dataOriginalHeight: height.toString(),
					});
					self.DOM.SetStyles(media, {
						width: `${width}px`,
						height: `${height}px`,
					});
				};

				if (!bUpdatable) return mediaFormat.CreateViaURL(matchedURL.url, {
					tagName: format,
					loadCallback
				});

				if (DOM.Utils.GetNodeName(figureElement) === format) {
					figureElement.src = matchedURL.url;
					return mediaFormat.OnLoadAndErrorEvents(figureElement, loadCallback);
				}

				mediaFormat.ChangeFigure(figure, {
					tagName: format,
					attrs: {
						src: matchedURL.url
					},
					loadCallback
				});
			};

			const { OptionWrapper, Input } = ui.CreateInputWrap({
				uiName,
				placeholder: bUpdatable ? 'Update the media URL' : 'Insert an media via URL',
				bUpdatable,
				createCallback: createVideo,
				src: bUpdatable ? figureElement.src : undefined
			});

			DOM.Insert(self.Frame.Root, OptionWrapper);
			formatUI.SetOptionListCoordinate(self, uiName, wrapper, OptionWrapper);
			Input.focus();
		};

	const Create = () => {
		const iconWrap = ui.CreateFormatButton(uiFormat);

		DOM.SetAttr(iconWrap.Button, 'no-border', '');

		formatUI.BindOptionListEvent(self, uiName, iconWrap.Wrapper, iconWrap.Wrapper, createOptionList(iconWrap.Wrapper));

		self.Toolbar.Add('Media', iconWrap.Wrapper);
	};

	return {
		Create
	};
};

export default MediaInserter;