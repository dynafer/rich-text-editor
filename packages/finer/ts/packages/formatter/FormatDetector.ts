import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { IFormatDetectorActivator, IFormatOptionBase } from './FormatType';
import { FindClosest } from './FormatUtils';

interface IDetection {
	(node: Node | null): Promise<void>;
}

export interface IFormatDetector {
	Register: (option: Omit<IFormatOptionBase, 'label'>, activate: IFormatDetectorActivator) => void,
}

const FormatDetector = (editor: Editor): IFormatDetector => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const detections: IDetection[] = [];

	self.On('caret:change', ((paths: Node[]) => {
		const carets = CaretUtils.Get();

		const closestNode = paths[0] ?? (DOM.Utils.IsText(carets[0].SameRoot) ? carets[0].SameRoot.parentNode : carets[0].SameRoot);

		for (const detection of detections) {
			void detection(closestNode);
		}
	}) as IEvent);

	const Register = (option: Omit<IFormatOptionBase, 'label'>, activate: IFormatDetectorActivator) => {
		const asyncDetection: IDetection = (node: Node | null) =>
			new Promise((resolve) => resolve(activate(FindClosest(self, option, node))));

		detections.push(asyncDetection);
	};

	return {
		Register
	};
};

export default FormatDetector;