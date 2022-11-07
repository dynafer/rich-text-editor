import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { EFormatType } from './FormatType';
import { CheckFormat } from './FormatUtils';

interface IDetection {
	(paths: EventTarget[]): Promise<void>
}

export interface IFormatDetector {
	DetectByTagName: (tagName: string, activate: (bActive: boolean) => void) => void,
	DetectByStyle: (styleName: string, activate: (bActive: boolean) => void) => void,
}

const FormatDetector = (editor: Editor) => {
	const self = editor;
	const CaretUtils = self.Utils.Caret;
	const detections: IDetection[] = [];

	self.On('caret:change', ((paths: EventTarget[]) => {
		const carets = CaretUtils.Get();

		for (const caret of carets) {
			paths = Arr.UniqueMerge(paths, caret.Start.Path, caret.End.Path);
		}

		for (const detection of detections) {
			void detection(paths);
		}
	}) as IEvent);

	const Register = (type: EFormatType, format: string, formatValue: string | undefined, activate: (bActive: boolean) => void) => {
		const checker = CheckFormat(self, { type, format, formatValue });

		const newDetection: IDetection = (paths: EventTarget[]) => new Promise((resolve) => {
			for (const path of paths) {
				if (checker(path as Node)) {
					return resolve(activate(true));
				}
			}

			return resolve(activate(false));
		});

		detections.push(newDetection);
	};

	return {
		Register
	};
};

export default FormatDetector;