import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { IFileSize } from './Type';

const createCommandName = (name: string): string => Str.Join(':', 'Media', name);
const createImageCommandName = (name: string): string => Str.Join(':', 'Image', name);
const createStyleCommandName = (name: string): string => Str.Join(':', 'MediaStyle', name);

export const COMMAND_NAMES_MAP = {
	MEDIA_CREATE: createCommandName('Create'),
	MEDIA_UPDATE: createCommandName('Update'),
	MEDIA_REMOVE: createCommandName('Remove'),
	IMAGE_CREATE: createImageCommandName('Create'),
	IMAGE_UPLOAD: createImageCommandName('Upload'),
	IMAGE_UPDATE: createImageCommandName('Update'),
	IMAGE_REMOVE: createImageCommandName('Remove'),
	FLOAT_LEFT: createStyleCommandName('FloatLeft'),
	FLOAT_RIGHT: createStyleCommandName('FloatRight'),
	ALIGN_LEFT: createStyleCommandName('AlignLeft'),
	ALIGN_CENTER: createStyleCommandName('AlignCenter'),
	ALIGN_RIGHT: createStyleCommandName('AlignRight'),
};

export const FILE_SIZE_UNITS = ['byte', 'KB', 'MB', 'GB', 'TB'];
export const MAX_BYTES = 1024;

export const CalculateFileSize = (type: string = 'auto', size: number = 0) => {
	const fileSize: IFileSize = {
		Size: size,
		Unit: FILE_SIZE_UNITS[0]
	};

	switch (Str.LowerCase(type)) {
		case 'kb':
		case 'mb':
		case 'gb':
		case 'tb':
			const power = Math.min(Math.floor(Math.log(size) / Math.log(MAX_BYTES)), FILE_SIZE_UNITS.length - 1);
			fileSize.Size = size / (MAX_BYTES ** power);
			fileSize.Unit = FILE_SIZE_UNITS[power];
			break;
		case 'auto':
			for (let index = 0, length = FILE_SIZE_UNITS.length; index < length; ++index) {
				const currentSize = size / (MAX_BYTES ** index);
				if (Math.floor(currentSize * 10) < 1) break;
				fileSize.Size = currentSize;
				fileSize.Unit = FILE_SIZE_UNITS[index];
			}
			break;
	}

	return fileSize;
};

export const GetAllowedExtensions = (mimeTypes: string[], accept?: string | string[]): string => {
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

export const GetMenuText = (editor: Editor, name: string, defaultText: string): string => editor.Lang(Str.Merge('plugins.parts.menu.', name), defaultText);