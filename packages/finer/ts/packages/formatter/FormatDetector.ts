import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { TFormatDetectCallback } from './FormatType';

interface IDetection {
	(node: Node[]): Promise<void>;
}

export interface IFormatDetector {
	Register: (callback: TFormatDetectCallback) => void,
}

const FormatDetector = (editor: Editor): IFormatDetector => {
	const self = editor;
	const CaretUtils = self.Utils.Caret;
	const detections: IDetection[] = [];

	self.On('caret:change', ((paths: Node[]) => {
		const caretPaths = Arr.Reverse(paths);
		if (Arr.IsEmpty(caretPaths)) {
			const carets = CaretUtils.Get();
			Arr.Push(caretPaths, ...Arr.Reverse(Arr.MergeUnique(carets[0].Start.Path, carets[0].End.Path)));
		}

		const promises: Promise<void>[] = [];
		Arr.Each(detections, detection => Arr.Push(promises, detection(caretPaths)));

		Promise.all(promises)
			.finally(() => CaretUtils.Clean());
	}) as IEvent);

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