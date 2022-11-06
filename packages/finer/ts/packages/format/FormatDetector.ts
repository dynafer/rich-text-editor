import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { EFormatType } from './FormatType';

interface IDetection {
	(paths: EventTarget[]): Promise<void>
}

interface IDetect {
	(node: Node, format: string): boolean
}

export interface IFormatDetector {
	DetectByTagName: (tagName: string, activate: (bActive: boolean) => void) => void,
	DetectByStyle: (styleName: string, activate: (bActive: boolean) => void) => void,
}

const FormatDetector = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const detections: IDetection[] = [];

	const detectByTagName = (node: Node, format: string): boolean => DOM.GetTagName(node) === format;
	const detectByStyle = (value: string) => (node: Node, format: string): boolean => DOM.HasStyle(node as HTMLElement, format, value);

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
		let detect: IDetect;

		switch (type) {
			case EFormatType.tag:
				detect = detectByTagName;
				break;
			case EFormatType.style:
				if (!formatValue) return;
				detect = detectByStyle(formatValue);
				break;
			default:
				return;
		}

		const newDetection: IDetection = (paths: EventTarget[]) => new Promise((resolve) => {
			for (const path of paths) {
				if (detect(path as Node, format)) {
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