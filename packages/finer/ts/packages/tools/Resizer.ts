import { Str, Type } from '@dynafer/utils';
import { EEditorMode } from '../../Options';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { IResizeOption } from './types/ResizerType';
import { RegisterMoveFinishEvents, RegisterStartEvent } from './Utils';

export interface IResizerTool {
	Resize: (opts: IResizeOption) => void,
}

const Resizer = (editor: Editor): IResizerTool => {
	const self = editor;
	const resizer = self.Frame.Resizer;

	const EDITOR_MINIMUM_WIDTH = 20;
	const EDITOR_MINIMUM_HEIGHT = 20;

	const Resize = (opts: IResizeOption) => {
		if (self.Config.Mode === EEditorMode.inline || !resizer) return;

		const { width, height } = opts;

		const setStyle = (type: 'width' | 'height', value?: string | number) => {
			if (!Type.IsNumber(value) && !Type.IsString(value)) return;

			const converted = Type.IsNumber(value) ? Str.Merge(value, 'px') : value;
			const target = type === 'width' ? self.Frame.Root : self.Frame.Container;
			DOM.SetStyle(target, type, converted);
		};

		const canChange = (type: 'horizontal' | 'vertical'): boolean =>
			self.Config.Resizable === type || self.Config.Resizable === 'all';

		if (canChange('horizontal')) setStyle('width', width);
		if (canChange('vertical')) setStyle('height', height);
	};

	const setup = () => {
		if (!resizer) return;

		const startResizing = (event: MouseEvent | Touch) => {
			self.Dispatch('Editor:Resize:Start');

			let startOffsetX = event.pageX;
			let startOffsetY = event.pageY;

			const minimumOffsetX = startOffsetX - self.Frame.Root.offsetWidth + EDITOR_MINIMUM_WIDTH;
			const minimumOffsetY = startOffsetY - self.Frame.Container.offsetHeight + EDITOR_MINIMUM_HEIGHT;

			const resizing = (e: MouseEvent | Touch) => {
				self.Dispatch('Editor:Resize:Move');
				const currentOffsetX = e.pageX;
				const currentOffsetY = e.pageY;

				const resizeOption: IResizeOption = {};

				if (currentOffsetX <= minimumOffsetX) {
					resizeOption.width = EDITOR_MINIMUM_WIDTH;
					startOffsetX = minimumOffsetX;
				} else {
					const calculatedX = currentOffsetX - startOffsetX;
					resizeOption.width = self.Frame.Root.offsetWidth + calculatedX;
					startOffsetX = currentOffsetX;
				}

				if (currentOffsetY <= minimumOffsetY) {
					resizeOption.height = EDITOR_MINIMUM_HEIGHT;
					startOffsetY = minimumOffsetY;
				} else {
					const calculatedY = currentOffsetY - startOffsetY;
					resizeOption.height = self.Frame.Container.offsetHeight + calculatedY;
					startOffsetY = currentOffsetY;
				}

				Resize(resizeOption);
			};

			const finish = () => self.Dispatch('Editor:Resize:Finish');

			RegisterMoveFinishEvents(self, resizing, finish, true);
		};

		RegisterStartEvent(self, startResizing, resizer);
	};

	setup();

	return {
		Resize,
	};
};

export default Resizer;