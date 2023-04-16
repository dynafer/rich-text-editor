import { Arr, Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { TConfigurationCallback, TConfigurationCommon } from '../../../packages/EditorConfigure';
import { IPluginMediaUI } from '../UI';
import BlobList, { IBlobList } from '../utils/BlobList';
import { IPluginsMediaFormatUI } from '../utils/Type';
import { COMMAND_NAMES_MAP, GetAllowedExtensions } from '../utils/Utils';

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

		const files = Arr.Convert(bMultiple ? fileList : [fileList[0]]);
		self.Commander.Run<File[] | string>(COMMAND_NAMES_MAP.IMAGE_UPLOAD, files, allowedExtensions);
		fileInput.value = '';

		if (!Type.IsFunction(uploadCallback)) return;
		uploadCallback(BlobList(...files));
	});

	const createOptionList = (wrapper: HTMLElement) =>
		() => {
			const figureElement = DOM.Element.Figure.SelectFigureElement<HTMLImageElement>(self.Tools.DOM.SelectFocused(false, 'media'));
			const bUpdatable = DOM.Utils.IsImage(figureElement);

			const createImage = (input: HTMLInputElement) => {
				const commandName = !bUpdatable ? COMMAND_NAMES_MAP.IMAGE_CREATE : COMMAND_NAMES_MAP.IMAGE_UPDATE;
				self.Commander.Run<string | Node | null>(commandName, input.value, figureElement);
			};

			const removeImage = () => {
				if (!figureElement) return;
				self.Commander.Run(COMMAND_NAMES_MAP.IMAGE_REMOVE, figureElement);
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

	ui.BindClickEvent(() => {
		self.GetBody().click();
		fileInput.click();
	}, iconWrap.Button);
	formatUI.BindOptionListEvent(self, uiName, iconWrap.Wrapper, iconWrap.Helper, createOptionList(iconWrap.Wrapper));

	self.Toolbar.Add(uiName, iconWrap.Wrapper);
};

export default ImageUploader;