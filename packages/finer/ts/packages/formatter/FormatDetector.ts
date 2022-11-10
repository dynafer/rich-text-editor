import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { EFormatType, IFormatDetectorActivator, IFormatOptionBase } from './FormatType';
import { CheckFormat } from './FormatUtils';

interface IDetection {
	(paths: Node[]): Promise<void>
}

export interface IFormatDetector {
	Register: (option: IFormatOptionBase, activate: IFormatDetectorActivator) => void,
}

const FormatDetector = (editor: Editor): IFormatDetector => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const detections: IDetection[] = [];

	self.On('caret:change', ((paths: Node[]) => {
		const carets = CaretUtils.Get();

		for (const caret of carets) {
			paths = Arr.UniqueMerge(paths, caret.Start.Path, caret.End.Path);
		}

		for (const detection of detections) {
			void detection(paths);
		}
	}) as IEvent);

	const getFormatValue = (option: IFormatOptionBase, node: Node): string => {
		switch (option.type) {
			case EFormatType.TAG:
				return DOM.Utils.GetNodeName(node);
			case EFormatType.STYLE:
			default:
				return DOM.GetStyle(node as HTMLElement, option.format);
		}
	};

	const Register = (option: IFormatOptionBase, activate: IFormatDetectorActivator) => {
		const checker = CheckFormat(self, option);

		const newDetection: IDetection = (paths: Node[]) => new Promise((resolve) => {
			for (const path of paths) {
				if (checker(path)) {
					return resolve(activate(true, getFormatValue(option, path)));
				}
			}

			return resolve(activate(false, getFormatValue(option, paths[paths.length - 1])));
		});

		detections.push(newDetection);
	};

	return {
		Register
	};
};

export default FormatDetector;