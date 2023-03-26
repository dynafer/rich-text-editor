import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { IBlobList } from '../utils/BlobList';

const Img = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const formatter = self.Formatter;

	const completeCreation = (...figures: HTMLElement[]) => {
		self.Focus();

		self.Tools.DOM.UnsetAllFocused();
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

	const CreateFromURL = (url: string) => {
		const figure = DOM.Element.Figure.Create('img');

		const image = DOM.Create('img', {
			attrs: {
				src: url
			}
		});

		const tools = self.Tools.DOM.Create('img', image);

		const loadEvent = () => {
			self.Tools.DOM.ChangePositions();
			DOM.Off(image, Finer.NativeEventMap.load, loadEvent);
		};

		DOM.On(image, Finer.NativeEventMap.load, loadEvent);
		DOM.On(image, Finer.NativeEventMap.error, () => DOM.Remove(figure, true));

		DOM.Insert(figure, image, tools);

		completeCreation(figure);
	};

	const CreateFromFiles = (files: IBlobList, extensions: string) => {
		const figures: HTMLElement[] = [];

		Arr.Each(files.GetList(), file => {
			if (!Str.Contains(extensions, '*') && !Str.Contains(extensions, file.GetType())) return;
			const figure = DOM.Element.Figure.Create('img');

			const image = DOM.Create('img', {
				attrs: {
					title: file.GetName()
				}
			});

			const tools = self.Tools.DOM.Create('img', image);

			const bFirst = Arr.IsEmpty(figures);

			file.Read('DataURL', result => {
				if (!Type.IsString(result)) return DOM.Remove(figure, true);

				DOM.SetAttr(image, 'src', result);
				DOM.On(image, Finer.NativeEventMap.error, () => DOM.Remove(figure, true));

				if (!bFirst) return;

				const update = () => {
					self.Tools.DOM.ChangePositions();
					DOM.Off(image, Finer.NativeEventMap.load, update);
				};
				DOM.On(image, Finer.NativeEventMap.load, update);
			});

			DOM.Insert(figure, image, tools);

			Arr.Push(figures, figure);
		});

		completeCreation(...figures);
	};

	return {
		CreateFromURL,
		CreateFromFiles,
	};
};

export default Img;