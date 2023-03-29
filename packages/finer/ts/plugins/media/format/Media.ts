import { Arr, Str, Type } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import { IBlobList } from '../utils/BlobList';

interface IFormatMediaOptions {
	tagName: string,
	attrs?: Record<string, string>,
	styles?: Record<string, string>,
	loadCallback?: (media: HTMLElement) => void,
}

export interface IFormatMedia {
	OnLoadAndErrorEvents: (media: HTMLElement, loadCallback?: (media: HTMLElement) => void) => void,
	ChangeFigure: (figure: HTMLElement, opts: IFormatMediaOptions) => void,
	CreateViaURL: (url: string, opts: IFormatMediaOptions) => void,
	CreateFromFiles: (files: IBlobList, extensions: string, opts: IFormatMediaOptions) => void,
}

const Media = (editor: Editor): IFormatMedia => {
	const self = editor;
	const DOM = self.DOM;
	const DOMTools = self.Tools.DOM;
	const CaretUtils = self.Utils.Caret;
	const formatter = self.Formatter;

	const completeCreation = (...figures: HTMLElement[]) => {
		self.Focus();

		DOMTools.UnsetAllFocused();
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

	const OnLoadAndErrorEvents = (media: HTMLElement, loadCallback?: (media: HTMLElement) => void) => {
		const loadOrErrorEvent = () => {
			if (Type.IsFunction(loadCallback)) loadCallback(media);
			DOMTools.ChangePositions();
			DOM.Off(media, Finer.NativeEventMap.loadeddata, loadOrErrorEvent);
			DOM.Off(media, Finer.NativeEventMap.load, loadOrErrorEvent);
			DOM.Off(media, Finer.NativeEventMap.error, loadOrErrorEvent);
		};

		DOM.On(media, Finer.NativeEventMap.loadeddata, loadOrErrorEvent);
		DOM.On(media, Finer.NativeEventMap.load, loadOrErrorEvent);
		DOM.On(media, Finer.NativeEventMap.error, loadOrErrorEvent);
	};

	const createMedia = (opts: IFormatMediaOptions) => {
		const { tagName, attrs, styles } = opts;

		const media = DOM.Create(tagName as 'iframe', {
			attrs: (Type.IsObject(attrs) ? attrs : {}),
			styles: (Type.IsObject(styles) ? styles : {}),
		});
		media.draggable = true;

		return media;
	};

	const ChangeFigure = (figure: HTMLElement, opts: IFormatMediaOptions) => {
		const { loadCallback } = opts;

		Arr.Each(DOM.GetChildren(figure), removable => DOM.Remove(removable, true));
		const media = createMedia(opts);
		const tools = self.Tools.DOM.Create('media', media);
		DOM.Insert(figure, media, tools);
		OnLoadAndErrorEvents(media, loadCallback);
	};

	const CreateViaURL = (url: string, opts: IFormatMediaOptions) => {
		const { loadCallback } = opts;

		const figure = DOM.Element.Figure.Create('media');
		figure.draggable = true;

		if (!opts.attrs) opts.attrs = {};
		opts.attrs.src = url;
		const media = createMedia(opts);

		const tools = DOMTools.Create('media', media);

		OnLoadAndErrorEvents(media, loadCallback);

		media.src = new URL(media.src).href;
		DOM.Insert(figure, media, tools);

		completeCreation(figure);
	};

	const CreateFromFiles = (files: IBlobList, extensions: string, opts: IFormatMediaOptions) => {
		const { loadCallback } = opts;

		const figures: HTMLElement[] = [];

		Arr.Each(files.GetList(), file => {
			if (!Str.Contains(extensions, '*') && !Str.Contains(extensions, file.GetType())) return;
			const figure = DOM.Element.Figure.Create('media');
			figure.draggable = true;

			if (!opts.attrs) opts.attrs = {};
			opts.attrs.title = file.GetName();
			const media = createMedia(opts);

			const tools = DOMTools.Create('media', media);

			file.Read('DataURL', result => {
				if (!Type.IsString(result)) return DOM.Remove(figure, true);

				media.src = result;

				OnLoadAndErrorEvents(media, loadCallback);
			});

			DOM.Insert(figure, media, tools);

			Arr.Push(figures, figure);
		});

		completeCreation(...figures);
	};

	return {
		OnLoadAndErrorEvents,
		ChangeFigure,
		CreateViaURL,
		CreateFromFiles,
	};
};

export default Media;