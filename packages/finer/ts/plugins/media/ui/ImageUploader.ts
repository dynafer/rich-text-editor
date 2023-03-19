import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { TConfigurationCallback, TConfigurationCommon } from '../../../packages/EditorConfigure';
import Img from '../format/Img';
import { IPluginImageUI } from '../UI';
import BlobList, { IBlobList } from '../utils/BlobList';
import { IPluginsMediaFormatUI } from '../utils/Type';

type TImageConfiguration = TConfigurationCommon<IBlobList, string>;
type TUploadCallback = TConfigurationCallback<IBlobList, string>;

const ImageUploader = (editor: Editor, ui: IPluginImageUI) => {
	const self = editor;
	const DOM = self.GetRootDOM();
	const formatUI = self.Formatter.UI;

	const uiName = 'Image';
	const uiFormat: IPluginsMediaFormatUI = {
		Title: 'Upload an image',
		Icon: 'Image'
	};

	const mimeTypes = ['jpeg', 'png', 'gif', 'bmp', 'svg+xml', 'webp', 'tiff', 'x-icon', 'vnd.microsoft.icon'];

	const getConfiguration = (): Record<string, TImageConfiguration> => {
		if (!Type.IsObject(self.Config.ImageConfiguration)) return {};
		return self.Config.ImageConfiguration as Record<string, TImageConfiguration>;
	};

	const getAllowedExtensions = (accept?: string | string[]): string => {
		if (!accept || accept === 'all') return 'image/*';

		const extensions: string[] = Type.IsArray(accept) ? accept : [];
		const availableExtensions: string[] = [];

		if (Type.IsString(accept)) {
			let copiedAccept = accept;
			if (Str.Contains(accept, ',')) copiedAccept = copiedAccept.replace(/\s+/g, '');
			copiedAccept = copiedAccept.replace(/\s+/g, ',');
			Arr.Push(extensions, ...copiedAccept.split(','));
		}

		Arr.Each(extensions, extension => {
			if (!Type.IsString(extension)) return;

			const escapedString = Str.LowerCase(extension.replace('image/', '').trim());

			Arr.Each(mimeTypes, (mimeType, exit) => {
				if (Arr.Contains(availableExtensions, mimeType) || (!Str.Contains(mimeType, escapedString) && !Str.Contains(escapedString, mimeType))) return;
				Arr.Push(availableExtensions, mimeType);
				exit();
			});
		});

		if (mimeTypes.length === availableExtensions.length || Arr.IsEmpty(availableExtensions)) return 'image/*';

		for (let index = 0, length = availableExtensions.length; index < length; ++index) {
			availableExtensions[index] = Str.Merge('image/', availableExtensions[index]);
		}
		return Str.Join(',', ...availableExtensions);
	};

	const configuration = getConfiguration();
	const bMultiple = Type.IsBoolean(configuration.multiple) ? configuration.multiple : true;
	const allowedExtensions = getAllowedExtensions(configuration.accept as string | string[] | undefined);
	const uploadCallback = configuration.uploadCallback as TUploadCallback | undefined;

	const inputOptions: Record<string, Record<string, string>> = {
		attrs: {
			type: 'file',
			accept: allowedExtensions,
		}
	};

	if (bMultiple) inputOptions.attrs.multiple = 'true';

	const createFileInput = () => {
		const fileInput = DOM.Create('input', inputOptions);

		DOM.On(fileInput, Finer.NativeEventMap.change, () => {
			const fileList = fileInput.files;
			if (!fileList) return DOM.Remove(fileInput);

			const files = BlobList(fileList);

			const img = Img(self);
			img.CreateFromCaret(files);

			if (!Type.IsFunction(uploadCallback)) return DOM.Remove(fileInput);

			uploadCallback(files);
		});

		fileInput.click();
	};

	const Create = () => {
		const iconWrap = ui.CreateButton(uiFormat);

		formatUI.BindOptionListEvent(self, uiName, iconWrap.Button, createFileInput);

		self.Toolbar.Add('Image', iconWrap.Wrapper);
	};

	return {
		Create
	};
};

export default ImageUploader;