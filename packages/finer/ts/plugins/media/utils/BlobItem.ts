import { IFileSize } from './Type';
import { CalculateFileSize } from './Utils';

export interface IBlobItem<T extends Blob = Blob> {
	Get: () => T,
	GetName: () => string,
	GetType: () => string,
	GetSize: (type?: string) => IFileSize,
}

const BlobItem = <T extends Blob = Blob>(file: T): IBlobItem<T> => {
	const Get = (): T => file;
	const GetName = (): string => file.name;
	const GetType = (): string => file.type;
	const GetSize = (type: string = 'auto'): IFileSize => CalculateFileSize(type, file.size);

	return {
		Get,
		GetName,
		GetType,
		GetSize,
	};
};

export default BlobItem;