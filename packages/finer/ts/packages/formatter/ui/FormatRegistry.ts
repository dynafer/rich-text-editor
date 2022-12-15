import { Arr } from '@dynafer/utils';
import Editor from '../../Editor';
import FormatDetector from '../FormatDetector';
import FormatUtils from '../FormatUtils';
import Block from './Block';
import Inline from './Inline';
import StyleFormat from './StyleFormat';

export interface IFormatRegistry {
	IsAvailable: (name: string) => boolean,
	Register: (name: string) => HTMLElement | null,
}

const FormatRegistry = (editor: Editor) => {
	const self = editor;
	const detector = FormatDetector(self);

	// UI list start
	const block = Block(self, detector);
	const inline = Inline(self, detector);
	const styleFormat = StyleFormat(self, detector);
	// UI list end

	const uiNames = Arr.MergeUnique(block.UINames, inline.UINames, styleFormat.UINames);

	const IsAvailable = (name: string): boolean => FormatUtils.HasFormatName(name, uiNames);

	const Register = (name: string): HTMLElement | null => {
		if (!IsAvailable(name)) return null;
		switch (true) {
			case FormatUtils.HasFormatName(name, block.UINames):
				return block.Create(name);
			case FormatUtils.HasFormatName(name, inline.UINames):
				return inline.Create(name);
			case FormatUtils.HasFormatName(name, styleFormat.UINames):
				return styleFormat.Create(name);
			default:
				return null;
		}
	};

	return {
		IsAvailable,
		Register,
	};
};

export default FormatRegistry;