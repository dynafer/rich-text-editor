import { IFileSize } from './Type';
import { CalculateFileSize } from './Utils';

export type TReadType = 'ArrayBuffer' | 'BinaryString' | 'DataURL' | 'Text';

export interface IBlobItem<T extends Blob = Blob> {
	Get: () => T,
	GetName: () => string,
	GetType: () => string,
	GetSize: (type?: string) => IFileSize,
	Read: <P extends TReadType>(type: P, loadCallback: (result: (P extends 'ArrayBuffer' ? ArrayBuffer : string) | null) => void) => void,
}

const BlobItem = <T extends Blob = Blob>(file: T): IBlobItem<T> => {
	const Get = (): T => file;
	const GetName = (): string => file.name;
	const GetType = (): string => file.type;
	const GetSize = (type: string = 'auto'): IFileSize => CalculateFileSize(type, file.size);

	const Read = <P extends TReadType>(type: P, loadCallback: (result: (P extends 'ArrayBuffer' ? ArrayBuffer : string) | null) => void) => {
		const reader = new FileReader();

		const load = () => {
			loadCallback(reader.result as (P extends 'ArrayBuffer' ? ArrayBuffer : string) | null);
			reader.removeEventListener(RichEditor.NativeEventMap.load, load);
		};

		reader.addEventListener('load', load);

		switch (type) {
			case 'ArrayBuffer':
				reader.readAsArrayBuffer(file);
				break;
			case 'BinaryString':
				reader.readAsBinaryString(file);
				break;
			case 'DataURL':
				reader.readAsDataURL(file);
				break;
			case 'Text':
				reader.readAsText(file);
				break;
		}
	};

	return {
		Get,
		GetName,
		GetType,
		GetSize,
		Read,
	};
};

export default BlobItem;