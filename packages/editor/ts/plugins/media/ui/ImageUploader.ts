import { Arr, Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { TConfigurationCallback, TConfigurationCommon } from '../../../packages/EditorConfigure';
import { IPluginMediaUI } from '../UI';
import BlobList, { IBlobList } from '../utils/BlobList';
import { IPluginsMediaFormatUI } from '../utils/Type';
import { COMMAND_NAMES_MAP, GetAllowedExtensions } from '../utils/Utils';

type TImageConfiguration = TConfigurationCommon<IBlobList, Promise<string>>;
type TUploadCallback = TConfigurationCallback<IBlobList, Promise<string | string[]>>;

const ImageUploader = (editor: Editor, ui: IPluginMediaUI) => {
	const self = editor;
	const DOM = self.DOM;
	const formatter = self.Formatter;
	const formatUI = formatter.UI;

	const uiName = 'Image';
	const uiFormat: IPluginsMediaFormatUI = {
		Title: self.Lang('plugins.media.image.title', 'Insert/Upload an image'),
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

	DOM.On(fileInput, RichEditor.NativeEventMap.change, () => {
		const fileList = fileInput.files;
		if (!fileList) return;

		const files = Arr.Convert(bMultiple ? fileList : [fileList[0]]);
		if (!Type.IsFunction(uploadCallback)) {
			self.Commander.Run<File[] | string>(COMMAND_NAMES_MAP.IMAGE_UPLOAD, files, allowedExtensions);
			fileInput.value = '';
			return;
		}

		uploadCallback(BlobList(...files))
			.then(urls => {
				if (Type.IsString(urls))
					return self.Commander.Run<File[] | string>(COMMAND_NAMES_MAP.IMAGE_CREATE, urls);

				Arr.Each(urls, url =>
					self.Commander.Run<File[] | string>(COMMAND_NAMES_MAP.IMAGE_CREATE, url)
				);
			})
			.catch(error => self.Notification.Dispatch(self.Notification.STATUS_MAP.ERROR, error, false));
	});

	const createOptionList = (wrapper: HTMLElement) =>
		(): HTMLElement => {
			const figureElement = DOM.Element.Figure.SelectFigureElement<HTMLImageElement>(self.Tools.Parts.SelectFocused(false, 'media'));
			const bUpdatable = DOM.Utils.IsImage(figureElement);

			const createImage = (input: HTMLInputElement) => {
				const commandName = !bUpdatable ? COMMAND_NAMES_MAP.IMAGE_CREATE : COMMAND_NAMES_MAP.IMAGE_UPDATE;
				self.Commander.Run<string | Node | null>(commandName, input.value, figureElement);
			};

			const removeImage = () => {
				if (!figureElement) return;
				self.Commander.Run(COMMAND_NAMES_MAP.IMAGE_REMOVE, figureElement);
			};

			const placeholderUpdate = self.Lang('plugins.media.image.update', 'Update the image URL');
			const placeholderInsert = self.Lang('plugins.media.image.insert', 'Insert an image via URL');

			const { OptionWrapper, Input } = formatUI.CreateInputWrapWithOptionList(self, {
				uiName,
				bUpdatable,
				createCallback: createImage,
				removeCallback: removeImage,
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

	ui.BindClickEvent(() => {
		formatUI.DestoryOpenedOptionList(self);
		fileInput.click();
	}, iconWrap.Button);
	formatUI.BindOptionListEvent(self, {
		type: uiName,
		activable: iconWrap.Wrapper,
		clickable: iconWrap.Helper,
		create: createOptionList(iconWrap.Wrapper)
	});

	self.Toolbar.Add(uiName, iconWrap.Wrapper);
};

export default ImageUploader;