import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { IFormatDetectorActivator, IFormatOptionBase } from './FormatType';
import { ConvertToElement, FindClosest, FindTopNodeStrict } from './FormatUtils';

interface IDetection {
	(node: Node | null): Promise<void>;
}

export interface IFormatDetector {
	Register: (option: IFormatOptionBase, activate: IFormatDetectorActivator, bIgnoreFormat?: boolean) => void,
}

const FormatDetector = (editor: Editor): IFormatDetector => {
	const self = editor;
	const CaretUtils = self.Utils.Caret;
	const detections: IDetection[] = [];

	self.On('caret:change', ((paths: Node[]) => {
		const carets = CaretUtils.Get();

		const closestNode = paths[0] ?? ConvertToElement(self, carets[0].SameRoot, true);

		const promises: Promise<void>[] = [];
		for (const detection of detections) {
			promises.push(detection(closestNode));
		}

		Promise.all(promises)
			.finally(() => CaretUtils.Clean());
	}) as IEvent);

	const Register = (option: IFormatOptionBase, activate: IFormatDetectorActivator, bIgnoreFormat: boolean = false) => {
		const find = option.bTopNode ? FindTopNodeStrict : FindClosest;
		const asyncDetection: IDetection = (node: Node | null) =>
			new Promise((resolve) => {
				activate(bIgnoreFormat ? node : find(self, option, node));
				resolve();
			});

		detections.push(asyncDetection);
	};

	return {
		Register
	};
};

export default FormatDetector;