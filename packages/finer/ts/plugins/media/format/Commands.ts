import { Arr } from '@dynafer/utils';
import Editor from '../../../packages/Editor';
import BlobList from '../utils/BlobList';
import { IPluginMediaCommand } from '../utils/Type';
import URLMatcher from '../utils/URLMatcher';
import { COMMAND_NAMES_MAP } from '../utils/Utils';
import Media from './Media';
import MediaStyles from './MediaStyles';

interface IMatchedURL {
	URL: string,
	format: string,
	width: number,
	height: number,
}

const Commands = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const styleCommands: IPluginMediaCommand[] = [
		{ Name: COMMAND_NAMES_MAP.FLOAT_LEFT, Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
		{ Name: COMMAND_NAMES_MAP.FLOAT_RIGHT, Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
		{ Name: COMMAND_NAMES_MAP.ALIGN_LEFT, Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
		{ Name: COMMAND_NAMES_MAP.ALIGN_CENTER, Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
		{ Name: COMMAND_NAMES_MAP.ALIGN_RIGHT, Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
	];

	const createStyleCommand = (format: IPluginMediaCommand) =>
		(bActive: boolean, node: Node) => {
			const { FigureElement } = DOM.Element.Figure.Find<HTMLElement>(node);
			if (!FigureElement) return null;

			const toggler = MediaStyles(self, format);
			toggler.Toggle(bActive, FigureElement);
		};

	const createLoadCallback = (width: number, height: number) =>
		(media: HTMLElement) => {
			if (DOM.Utils.IsVideo(media)) {
				media.controls = true;
				return;
			}

			DOM.SetAttrs(media, {
				dataOriginalWidth: width.toString(),
				dataOriginalHeight: height.toString(),
			});
			DOM.SetStyles(media, {
				width: `${width}px`,
				height: `${height}px`,
			});
		};

	const getMatchedURL = (url: string): IMatchedURL => {
		const matchedURL = URLMatcher.Match(url);
		const format = matchedURL.Format ?? 'video';
		const width = matchedURL.Width ?? 640;
		const height = matchedURL.Height ?? 360;

		return {
			URL: matchedURL.URL,
			format,
			width,
			height,
		};
	};

	const createImageLoadCallback = (total: number) => {
		const flagId = self.History.Flag();
		let numLoaded = 0;

		return () => {
			++numLoaded;
			if (total > numLoaded) return;
			self.History.ChangeData(flagId, self.History.CreateData());
			self.History.Unflag();
		};
	};

	const createImageCommand = (url: string) => {
		const mediaFormat = Media(self);
		mediaFormat.CreateViaURL(url, { tagName: 'img' });
	};

	const createImageUploadCommand = (fileList: File[], allowedExtensions: string) => {
		if (Arr.IsEmpty(fileList)) return;
		const files = BlobList(...fileList);

		const mediaFormat = Media(self);
		mediaFormat.CreateFromFiles(files, allowedExtensions, {
			tagName: 'img',
			loadCallback: createImageLoadCallback(files.GetLength()),
		});
	};

	const createImageUpdateCommand = (url: string, node: Node) => {
		const { Figure, FigureElement } = DOM.Element.Figure.Find(node);
		if (!Figure || !DOM.Utils.IsImage(FigureElement)) return;

		const mediaFormat = Media(self);
		FigureElement.src = url;
		mediaFormat.OnLoadAndErrorEvents(FigureElement, createImageLoadCallback(1));
	};

	const createMediaCommand = (url: string) => {
		const mediaFormat = Media(self);
		const matchedURL = getMatchedURL(url);

		mediaFormat.CreateViaURL(matchedURL.URL, {
			tagName: matchedURL.format,
			loadCallback: createLoadCallback(matchedURL.width, matchedURL.height)
		});
	};

	const createMediaUpdateCommand = (url: string, node: Node) => {
		const { Figure, FigureElement } = DOM.Element.Figure.Find(node);
		if (!Figure || (!DOM.Utils.IsIFrame(FigureElement) && !DOM.Utils.IsVideo(FigureElement))) return;

		const mediaFormat = Media(self);
		const matchedURL = getMatchedURL(url);

		const loadCallback = createLoadCallback(matchedURL.width, matchedURL.height);

		if (DOM.Utils.GetNodeName(FigureElement) === matchedURL.format) {
			FigureElement.src = matchedURL.URL;
			return mediaFormat.OnLoadAndErrorEvents(FigureElement, loadCallback);
		}

		mediaFormat.ChangeFigure(Figure, {
			tagName: matchedURL.format,
			attrs: { src: matchedURL.URL },
			loadCallback
		});
	};

	const createRemoveCommand = (node: Node) => DOM.Element.Figure.Remove(self, node);

	Arr.Each(styleCommands, command => self.Commander.Register(command.Name, createStyleCommand(command)));

	const Register = (type: string) => {
		switch (type) {
			case 'Image':
				self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_CREATE, createImageCommand);
				self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_UPLOAD, createImageUploadCommand);
				self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_UPDATE, createImageUpdateCommand);
				return self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_REMOVE, createRemoveCommand);
			case 'Media':
				self.Commander.Register(COMMAND_NAMES_MAP.MEDIA_CREATE, createMediaCommand);
				self.Commander.Register(COMMAND_NAMES_MAP.MEDIA_UPDATE, createMediaUpdateCommand);
				return self.Commander.Register(COMMAND_NAMES_MAP.MEDIA_REMOVE, createRemoveCommand);
		}
	};

	return {
		Register,
	};
};

export default Commands;