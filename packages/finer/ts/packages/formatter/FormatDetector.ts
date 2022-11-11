import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { EFormatType, IFormatDetectorActivator, IFormatOptionBase } from './FormatType';
import { CheckFormat } from './FormatUtils';

interface IDetection {
	(paths: Node[]): Promise<void>
}

export interface IFormatDetector {
	CreateDetection: (paths: Node[], option: IFormatOptionBase, activate: IFormatDetectorActivator) => void,
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
			paths = Arr.MergeUnique(paths, caret.Start.Path, caret.End.Path);
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

	const CreateDetection = (paths: Node[], option: IFormatOptionBase, activate: IFormatDetectorActivator) => {
		const checker = CheckFormat(self, option);

		for (const path of paths) {
			if (checker(path)) return activate(true, getFormatValue(option, path));
		}

		return activate(false, getFormatValue(option, paths[paths.length - 1]));
	};

	const Register = (option: IFormatOptionBase, activate: IFormatDetectorActivator) => {
		const asyncDetection: IDetection = (paths: Node[]) =>
			new Promise((resolve) => resolve(CreateDetection(paths, option, activate)));

		detections.push(asyncDetection);
	};

	return {
		CreateDetection,
		Register
	};
};

export default FormatDetector;