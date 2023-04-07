import { Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { TConfigurationCallback, TConfigurationCommon } from '../../../packages/EditorConfigure';
import Media from '../format/Media';
import { IPluginMediaUI } from '../UI';
import BlobList, { IBlobList } from '../utils/BlobList';
import { IPluginsMediaFormatUI } from '../utils/Type';
import { GetAllowedExtensions } from '../utils/Utils';

type TImageConfiguration = TConfigurationCommon<IBlobList, string>;
type TUploadCallback = TConfigurationCallback<IBlobList, string>;

const ImageUploader = (editor: Editor, ui: IPluginMediaUI) => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatter = self.Formatter;
	const formatUI = formatter.UI;

	const uiName = 'Image';
	const uiFormat: IPluginsMediaFormatUI = {
		Title: Finer.ILC.Get('plugins.media.image.title') ?? 'Insert/Upload an image',
		Icon: 'Image'
	};

	const mimeTypes = ['jpeg', 'png', 'gif', 'bmp', 'svg+xml', 'webp', 'tiff', 'x-icon', 'vnd.microsoft.icon'];

	const getConfiguration = (): Record<string, TImageConfiguration> => {
		if (!Type.IsObject(self.Config.ImageConfiguration)) return {};
		return self.Config.ImageConfiguration as Record<string, TImageConfiguration>;
	};

	const configuration = getConfiguration();
	const bMultiple = Type.IsBoolean(configuration.multiple) ? configuration.multiple : true;
	const allowedExtensions = GetAllowedExtensions(mimeTypes, configuration.accept as string);
	const uploadCallback = configuration.uploadCallback as TUploadCallback;

	const inputOptions: Record<string, Record<string, string>> = {
		attrs: {
			type: 'file',
			accept: allowedExtensions,
		}
	};

	if (bMultiple) inputOptions.attrs.multiple = 'true';

	const fileInput = DOM.Create('input', inputOptions);

	DOM.On(fileInput, Finer.NativeEventMap.change, () => {
		const fileList = fileInput.files;
		if (!fileList) return;

		const files = BlobList(fileList);

		const mediaFormat = Media(self);
		mediaFormat.CreateFromFiles(files, allowedExtensions, { tagName: 'img' });
		fileInput.value = '';

		if (!Type.IsFunction(uploadCallback)) return;
		uploadCallback(files);
	});

	const createOptionList = (wrapper: HTMLElement) =>
		() => {
			const figureElement = DOM.Element.Figure.SelectFigureElement<HTMLImageElement>(self.Tools.DOM.SelectFocused(false, 'media'));
			const bUpdatable = DOM.Utils.IsImage(figureElement);

			const createImage = (input: HTMLInputElement) => {
				const mediaFormat = Media(self);

				if (!bUpdatable) return mediaFormat.CreateViaURL(input.value, { tagName: 'img' });

				figureElement.src = input.value;
				mediaFormat.OnLoadAndErrorEvents(figureElement);
			};

			const removeImage = () => {
				if (!figureElement) return;
				DOM.Remove(figureElement.parentElement);
			};

			const placeholderUpdate = Finer.ILC.Get('plugins.media.image.update') ?? 'Update the image URL';
			const placeholderInsert = Finer.ILC.Get('plugins.media.image.insert') ?? 'Insert an image via URL';

			const { OptionWrapper, Input } = formatUI.CreateInputWrapWithOptionList({
				uiName,
				bUpdatable,
				createCallback: createImage,
				removeCallback: removeImage,
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

	ui.BindClickEvent(() => fileInput.click(), iconWrap.Button);
	formatUI.BindOptionListEvent(self, uiName, iconWrap.Wrapper, iconWrap.Helper, createOptionList(iconWrap.Wrapper));

	self.Toolbar.Add(uiName, iconWrap.Wrapper);
};

export default ImageUploader;