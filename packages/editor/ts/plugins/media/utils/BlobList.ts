import { Arr } from '@dynafer/utils';
import BlobItem, { IBlobItem } from './BlobItem';
import { IFileSize } from './Type';
import { CalculateFileSize } from './Utils';

export interface IBlobList {
	Get: () => File[],
	GetList: () => IBlobItem[],
	GetLength: () => number,
	GetTotalSize: (type?: string) => IFileSize,
}

const BlobList = (...list: File[]): IBlobList => {
	const files: IBlobItem[] = [];

	Arr.Each(list, file => Arr.Push(files, BlobItem(file)));

	const Get = (): File[] => list;
	const GetList = (): IBlobItem[] => files;
	const GetLength = (): number => files.length;

	const GetTotalSize = (type: string = 'auto'): IFileSize => {
		let bytes = 0;
		Arr.Each(files, file => {
			bytes += file.GetSize('byte').Size;
		});

		return CalculateFileSize(type, bytes);
	};

	return {
		Get,
		GetList,
		GetLength,
		GetTotalSize,
	};
};

export default BlobList;