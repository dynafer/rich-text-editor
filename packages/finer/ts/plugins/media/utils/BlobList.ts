import { Arr } from '@dynafer/utils';
import BlobItem, { IBlobItem } from './BlobItem';
import { IFileSize } from './Type';
import { CalculateFileSize } from './Utils';

export interface IBlobList {
	Get: () => FileList,
	GetList: () => IBlobItem[],
	GetLength: () => number,
	GetTotalSize: (type?: string) => IFileSize,
}

const BlobList = (list: FileList) => {
	const files: IBlobItem[] = [];

	Arr.Each(list, file => Arr.Push(files, BlobItem(file)));

	const Get = (): FileList => list;
	const GetList = (): IBlobItem[] => files;
	const GetLength = (): number => files.length;

	const GetTotalSize = (type: string = 'auto'): IFileSize => {
		let bytes = 0;
		Arr.Each(files, file => {
			bytes += file.GetSize('byte').size;
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