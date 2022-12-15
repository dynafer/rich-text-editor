import { Arr, Str } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';

export type TConfigOption = string | string[] | Record<string, string>;

export type TCaretPath = {
	bRange: false,
	Marker: string,
	Offset: number,
} | {
	bRange: true,
	StartMarker: string,
	StartOffset: number,
	EndMarker: string,
	EndOffset: number,
};

const FormatUtils = () => {
	const STANDARD_POINTS_FROM_PIXEL = 0.75;
	const STANDARD_PIXEL_FROM_POINTS = 1 / STANDARD_POINTS_FROM_PIXEL;
	const STANDARD_PIXEL_FROM_ROOT = 16;

	const GetPixelString = (value: number) => Str.Merge(value.toString(), 'px');
	const GetPixcelFromRoot = (): string => GetPixelString(STANDARD_PIXEL_FROM_ROOT);
	const ConvertPointsToPixel = (value: number): number => Math.round(value * STANDARD_PIXEL_FROM_POINTS * 100) / 100;
	const ConvertPixelToPoints = (value: number): number => Math.round(value * STANDARD_POINTS_FROM_PIXEL * 100) / 100;
	const MultiplyPixelSize = (value: number): number => value * STANDARD_PIXEL_FROM_ROOT;

	const GetFormatName = (finder: string, names: string[]): string => {
		const lowerCase = Str.LowerCase(finder);
		for (const name of names) {
			if (lowerCase === Str.LowerCase(Str.CapitalToUnderline(name)) || lowerCase === Str.LowerCase(name)) return name;
		}
		return '';
	};

	const HasFormatName = (finder: string, names: string[]): boolean => {
		const lowerCase = Str.LowerCase(finder);
		for (const name of names) {
			if (lowerCase === Str.LowerCase(Str.CapitalToUnderline(name)) || lowerCase === Str.LowerCase(name)) return true;
		}
		return false;
	};

	const GetFormatConfig = (editor: Editor, defaultOptions: TConfigOption, configName: string): TConfigOption => {
		const self = editor;

		if (!!self.Config[configName]) return self.Config[configName] as TConfigOption;

		return defaultOptions;
	};

	const LabelConfigArray = (config: string[]): Record<string, string> => {
		const newMap: Record<string, string> = {};
		for (const item of config) {
			newMap[item] = item;
		}

		return newMap;
	};

	const GetParentIfText = (node: Node): Node =>
		DOM.Utils.IsText(node) ? node.parentNode as Node : node;

	const createMarkings = (editor: Editor): TCaretPath[] => {
		const self = editor;
		const CaretUtils = self.Utils.Caret;
		const carets = CaretUtils.Get();

		const markings: TCaretPath[] = [];

		const createMarking = (): [string, Node] => {
			const id = DOM.Utils.CreateUEID('marking');
			const marker = self.DOM.Create('span', {
				attrs: {
					id,
					marker: 'true',
				}
			});

			return [id, marker];
		};

		for (const caret of carets) {
			if (!caret.IsRange()) {
				const newMarker = createMarking();
				self.DOM.InsertBefore(caret.Start.Node, newMarker[1]);
				Arr.Push(markings, {
					bRange: false,
					Marker: newMarker[0],
					Offset: caret.Start.Offset,
				});
				continue;
			}

			const startMarker = createMarking();
			const endMarker = createMarking();

			self.DOM.InsertBefore(caret.Start.Node, startMarker[1]);
			self.DOM.InsertAfter(caret.End.Node, endMarker[1]);

			Arr.Push(markings, {
				bRange: true,
				StartMarker: startMarker[0],
				StartOffset: caret.Start.Offset,
				EndMarker: endMarker[0],
				EndOffset: caret.End.Offset,
			});
		}

		CaretUtils.Clean();

		return markings;
	};

	const applyCaretsByMarkings = (editor: Editor, markings: TCaretPath[]) => {
		const self = editor;
		const newRanges: Range[] = [];

		const getTextNode = (parent: Node): Node => {
			let node = parent;
			if (!DOM.Utils.IsText(node)) {
				while (node && !DOM.Utils.IsText(node)) {
					node = node.childNodes[0];
				}
			}

			return node;
		};

		for (const marking of markings) {
			const newRange = self.Utils.Range();

			if (!marking.bRange) {
				const marker = getTextNode(self.DOM.Select(`#${marking.Marker}`).nextSibling as Node);
				newRange.SetStartToEnd(marker, marking.Offset, marking.Offset);
				Arr.Push(newRanges, newRange.Get());
				continue;
			}

			const startMarker = getTextNode(self.DOM.Select(`#${marking.StartMarker}`).nextSibling as Node);
			const endMarker = getTextNode(self.DOM.Select(`#${marking.EndMarker}`).previousSibling as Node);
			newRange.SetStart(startMarker, marking.StartOffset);
			newRange.SetEnd(endMarker, marking.EndOffset);
			Arr.Push(newRanges, newRange.Get());
		}

		self.Utils.Caret.UpdateRanges(newRanges);

		for (const marking of self.DOM.SelectAll('[marker="true"]')) {
			self.DOM.Remove(marking);
		}
	};

	const RunFormatting = (editor: Editor, toggle: () => void) => {
		const self = editor;
		const markings: TCaretPath[] = createMarkings(self);

		toggle();

		applyCaretsByMarkings(self, markings);
	};

	const SplitTextNode = (editor: Editor, node: Node, start: number, end: number): Node | null => {
		if (!DOM.Utils.IsText(node)) return null;

		const self = editor;

		const parent = node.parentNode;
		const text = node.textContent;
		if (!parent || !text) return null;

		const startNode = self.DOM.CreateTextNode(text.slice(0, start));
		const middleNode = self.DOM.CreateTextNode(text.slice(start, end));
		const endNode = self.DOM.CreateTextNode(text.slice(end, text.length));

		const bInsertedStartNode = startNode.length > 0;

		const fragment = self.DOM.CreateFragment();
		if (startNode.length > 0) fragment.append(startNode);
		if (middleNode.length > 0) fragment.append(middleNode);
		if (endNode.length > 0) fragment.append(endNode);

		const index = Arr.Find(parent.childNodes, node) + (bInsertedStartNode ? 1 : 0);
		parent.replaceChild(fragment, node);

		return parent.childNodes[index];
	};

	const GetStyleSelector = (styles: Record<string, string>, value?: string): (string | Record<string, string>)[] => {
		const createdSelector: (string | Record<string, string>)[] = [];
		const selectorMap = {};
		for (const [styleName, styleValue] of Object.entries(styles)) {
			if (styleValue === '{{value}}') {
				if (!!value) selectorMap[styleName] = value;
				else createdSelector.push(styleName);
				continue;
			}

			selectorMap[styleName] = styleValue;
		}
		createdSelector.push(selectorMap);

		return createdSelector;
	};

	return {
		GetPixelString,
		GetPixcelFromRoot,
		ConvertPointsToPixel,
		ConvertPixelToPoints,
		MultiplyPixelSize,
		GetFormatName,
		HasFormatName,
		GetFormatConfig,
		LabelConfigArray,
		GetParentIfText,
		RunFormatting,
		SplitTextNode,
		GetStyleSelector,
	};
};

export default FormatUtils();