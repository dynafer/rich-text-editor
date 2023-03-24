import { Str } from '@dynafer/utils';
import { IFileSize } from './Type';

export const FILE_SIZE_UNITS = ['byte', 'KB', 'MB', 'GB', 'TB'];
export const MAX_BYTES = 1024;

export const IMAGE_MENU_ADDABLE_TOP = 6;

export const CalculateFileSize = (type: string = 'auto', size: number = 0) => {
	const fileSize: IFileSize = {
		size,
		unit: FILE_SIZE_UNITS[0]
	};

	switch (Str.LowerCase(type)) {
		case 'kb':
		case 'mb':
		case 'gb':
		case 'tb':
			const power = Math.min(Math.floor(Math.log(size) / Math.log(MAX_BYTES)), FILE_SIZE_UNITS.length - 1);
			fileSize.size = size / (MAX_BYTES ** power);
			fileSize.unit = FILE_SIZE_UNITS[power];
			break;
		case 'auto':
			for (let index = 0, length = FILE_SIZE_UNITS.length; index < length; ++index) {
				const currentSize = size / (MAX_BYTES ** index);
				if (Math.floor(currentSize * 10) < 1) break;
				fileSize.size = currentSize;
				fileSize.unit = FILE_SIZE_UNITS[index];
			}
			break;
	}

	return fileSize;
};