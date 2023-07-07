import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { TFormatDetectCallback } from './FormatType';

interface IDetection {
	(node: Node[]): Promise<void>;
}

export interface IFormatDetector {
	Register: (callback: TFormatDetectCallback) => void,
}

const FormatDetector = (editor: Editor): IFormatDetector => {
	const self = editor;
	const detections: IDetection[] = [];

	self.On('Caret:Change', (paths: Node[]) => {
		const promises: Promise<void>[] = [];
		Arr.Each(detections, detection => Arr.Push(promises, detection(paths)));

		void Promise.all(promises);
	});

	const Register = (callback: TFormatDetectCallback) => {
		const asyncDetection: IDetection = (paths: Node[]) =>
			new Promise((resolve) => resolve(callback(paths)));

		Arr.Push(detections, asyncDetection);
	};

	return {
		Register
	};
};

export default FormatDetector;