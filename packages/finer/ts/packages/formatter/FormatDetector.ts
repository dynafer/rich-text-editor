import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { IFormatDetectorActivator, IFormatOptionBase } from './FormatType';
import { FindClosest } from './FormatUtils';

interface IDetection {
	(node: Node | null): Promise<void>;
}

export interface IFormatDetector {
	Register: (option: IFormatOptionBase, activate: IFormatDetectorActivator, bIgnoreFormat?: boolean) => void,
}

const FormatDetector = (editor: Editor): IFormatDetector => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const detections: IDetection[] = [];

	self.On('caret:change', ((paths: Node[]) => {
		const carets = CaretUtils.Get();

		const closestNode = paths[0] ?? (DOM.Utils.IsText(carets[0].SameRoot) ? carets[0].SameRoot.parentNode : carets[0].SameRoot);

		const promises: Promise<void>[] = [];
		for (const detection of detections) {
			promises.push(detection(closestNode));
		}

		Promise.all(promises)
			.finally(() => CaretUtils.Clean());
	}) as IEvent);

	const Register = (option: IFormatOptionBase, activate: IFormatDetectorActivator, bIgnoreFormat: boolean = false) => {
		const asyncDetection: IDetection = (node: Node | null) =>
			new Promise((resolve) => {
				activate(bIgnoreFormat ? node : FindClosest(self, option, node));
				resolve();
			});

		detections.push(asyncDetection);
	};

	return {
		Register
	};
};

export default FormatDetector;