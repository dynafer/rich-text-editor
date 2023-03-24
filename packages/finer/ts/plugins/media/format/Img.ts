import { Arr, Str } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { IBlobList } from '../utils/BlobList';

const Img = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const formatter = self.Formatter;

	const CreateFromCaret = (files: IBlobList) => {
		const figures: HTMLElement[] = [];

		const focusedFigures = DOM.SelectAll({
			attrs: [Finer.Options.ATTRIBUTE_FOCUSED]
		}, self.GetBody());

		Arr.Each(focusedFigures, focused => DOM.RemoveAttr(focused, Finer.Options.ATTRIBUTE_FOCUSED));
		self.Tools.DOM.HideAll();

		Arr.Each(files.GetList(), file => {
			const figure = DOM.Element.Figure.Create('img');

			const image = DOM.Create('img', {
				attrs: {
					title: file.GetName()
				}
			});

			const tools = self.Tools.DOM.Create('img', image);

			const bFirst = Arr.IsEmpty(figures);

			const reader = new FileReader();
			reader.addEventListener('load', () => {
				DOM.SetAttr(image, 'src', reader.result as string);
				if (!bFirst) return;

				const update = () => {
					self.Tools.DOM.ChangePositions();
					DOM.Off(image, Finer.NativeEventMap.load, update);
				};
				DOM.On(image, Finer.NativeEventMap.load, update);
			});
			reader.readAsDataURL(file.Get());

			DOM.Insert(figure, image, tools);

			Arr.Push(figures, figure);
		});

		self.Focus();

		CaretUtils.Get()[0]?.Range.DeleteContents();

		formatter.Utils.CleanDirty(self, CaretUtils.Get()[0]);

		const caret = CaretUtils.Get()[0];
		const lines = DOM.GetChildren(self.GetBody());

		const finish = () => {
			const newRange = self.Utils.Range();
			newRange.SetStartToEnd(figures[0], 1, 1);
			CaretUtils.UpdateRanges(newRange);
			self.Utils.Shared.DispatchCaretChange([figures[0]]);
			Arr.Clean(figures);
		};

		if (!caret) {
			const insert = Arr.IsEmpty(lines) ? DOM.Insert : DOM.InsertAfter;
			const target = Arr.IsEmpty(lines) ? self.GetBody() : lines[0];
			const insertions = Arr.IsEmpty(lines) ? figures : Arr.Reverse(figures);
			insert(target, ...insertions);
			return finish();
		}

		const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);

		const node = formatter.Utils.GetParentIfText(caret.Start.Node);
		const blockNode = StartBlock ?? DOM.Closest(node, Str.Join(',', ...formatter.Formats.BlockFormatTags.Block)) ?? lines[0];
		const insert = !blockNode ? DOM.Insert : DOM.InsertAfter;
		const insertions = !blockNode ? [...figures, EndBlock] : [EndBlock, ...Arr.Reverse(figures)];
		insert(blockNode ?? self.GetBody(), ...insertions);

		finish();
	};

	return {
		CreateFromCaret,
	};
};

export default Img;