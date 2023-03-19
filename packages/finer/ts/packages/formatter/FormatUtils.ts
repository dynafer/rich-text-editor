import { Arr, Obj, Str, Type } from '@dynafer/utils';
import Options from '../../Options';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ICaretData } from '../editorUtils/caret/CaretUtils';
import { IRangeUtils } from '../editorUtils/caret/RangeUtils';
import { BlockFormatTags, FigureSelector, TableCellSet, TableSelector } from './Format';

export type TConfigOption = string | string[] | Record<string, string>;

export type TFormatProcessor = (bWrap: boolean, caret: ICaretData, value?: string) => boolean;

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

export interface IProcessorOption {
	bWrap: boolean,
	value?: string,
	tableProcessor: (bWrap: boolean, value?: string) => ReturnType<TFormatProcessor>,
	processors: ({
		processor: TFormatProcessor,
		bSkipFocus?: boolean,
	})[],
	afterProcessors?: (caret: ICaretData) => void,
}

export interface IFormatUtils {
	GetPixelString: (value: number) => string,
	GetPixcelFromRoot: () => string,
	ConvertPointsToPixel: (value: number) => number,
	ConvertPixelToPoints: (value: number) => number,
	MultiplyPixelSize: (value: number) => number,
	GetFormatName: (finder: string, names: string[]) => string,
	HasFormatName: (finder: string, names: string[]) => boolean,
	GetFormatConfig: (editor: Editor, defaultOptions: TConfigOption, configName: string) => TConfigOption,
	LabelConfigArray: (config: string[]) => Record<string, string>,
	GetParentIfText: (node: Node) => Node,
	RunFormatting: (editor: Editor, toggle: () => void) => void,
	SplitTextNode: (editor: Editor, node: Node, start: number, end: number) => Node | null,
	GetStyleSelectorMap: (styles: Record<string, string>, value?: string) => (string | Record<string, string>)[],
	GetTableItems: (editor: Editor, bSelected: boolean, table?: Node) => Node[],
	ExceptNodes: (editor: Editor, node: Node, root: Node, bPrevious?: boolean) => Node[],
	SerialiseWithProcessors: (editor: Editor, options: IProcessorOption) => void,
	CleanDirty: (editor: Editor, caret: ICaretData) => void,
}

const FormatUtils = (): IFormatUtils => {
	const STANDARD_POINTS_FROM_PIXEL = 0.75;
	const STANDARD_PIXEL_FROM_POINTS = 1 / STANDARD_POINTS_FROM_PIXEL;
	const STANDARD_PIXEL_FROM_ROOT = 16;

	const GetPixelString = (value: number): string => `${value}px`;
	const GetPixcelFromRoot = (): string => GetPixelString(STANDARD_PIXEL_FROM_ROOT);
	const ConvertPointsToPixel = (value: number): number => Math.round(value * STANDARD_PIXEL_FROM_POINTS * 100) / 100;
	const ConvertPixelToPoints = (value: number): number => Math.round(value * STANDARD_POINTS_FROM_PIXEL * 100) / 100;
	const MultiplyPixelSize = (value: number): number => value * STANDARD_PIXEL_FROM_ROOT;

	const GetFormatName = (finder: string, names: string[]): string => {
		const lowerCase = Str.LowerCase(finder);
		for (let index = 0, length = names.length; index < length; ++index) {
			const name = names[index];
			if (lowerCase === Str.LowerCase(Str.CapitalToUnderline(name)) || lowerCase === Str.LowerCase(name)) return name;
		}
		return '';
	};

	const HasFormatName = (finder: string, names: string[]): boolean => {
		const lowerCase = Str.LowerCase(finder);
		for (let index = 0, length = names.length; index < length; ++index) {
			const name = names[index];
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
		Arr.Each(config, item => {
			newMap[item] = item;
		});

		return newMap;
	};

	const GetParentIfText = (node: Node): Node =>
		DOM.Utils.IsText(node) ? node.parentNode as Node : node;

	const createMarkers = (editor: Editor): TCaretPath[] => {
		const self = editor;
		if (self.DOM.Select({ tagName: TableSelector, attrs: [Options.ATTRIBUTE_SELECTED] }, self.GetBody())) return [];

		const CaretUtils = self.Utils.Caret;
		const carets = CaretUtils.Get();

		const markers: TCaretPath[] = [];

		const createMarker = (): [string, Node] => {
			const id = DOM.Utils.CreateUEID('marker');
			const marker = self.DOM.Create('span', {
				attrs: {
					id,
					marker: 'true',
				}
			});

			return [id, marker];
		};

		const getChildOrCreateBr = (target: Node, bFirst: boolean): Node => {
			const getChild = bFirst ? self.DOM.Utils.GetFirstChild : self.DOM.Utils.GetLastChild;
			const child = getChild(target, true);
			if (child) return child;

			const brElement = self.DOM.Create('br');
			self.DOM.Insert(target, brElement);
			return brElement;
		};

		Arr.Each(carets, caret => {
			let startNode = caret.Start.Node;
			let endNode = caret.End.Node;
			const startNodeName = self.DOM.Utils.GetNodeName(startNode);
			const endNodeName = self.DOM.Utils.GetNodeName(endNode);

			if (BlockFormatTags.Figures.has(startNodeName) || BlockFormatTags.Figures.has(endNodeName)) {
				const newMarker = createMarker();
				if (startNodeName === FigureSelector || endNodeName === FigureSelector) {
					const figureType = self.DOM.GetAttr(startNode, 'type');
					if (!figureType) return;
					startNode = self.DOM.Select(figureType, startNode);
					if (!startNode) return;
				}

				self.DOM.InsertBefore(startNode, newMarker[1]);
				return Arr.Push(markers, {
					bRange: false,
					Marker: newMarker[0],
					Offset: 0,
				});
			}

			if (BlockFormatTags.Block.has(startNodeName)) startNode = getChildOrCreateBr(startNode, true);
			if (BlockFormatTags.Block.has(endNodeName)) endNode = getChildOrCreateBr(endNode, false);

			if (!caret.IsRange()) {
				const newMarker = createMarker();
				self.DOM.InsertBefore(startNode, newMarker[1]);
				return Arr.Push(markers, {
					bRange: false,
					Marker: newMarker[0],
					Offset: caret.Start.Offset,
				});
			}

			const startMarker = createMarker();
			const endMarker = createMarker();

			self.DOM.InsertBefore(startNode, startMarker[1]);
			self.DOM.InsertAfter(endNode, endMarker[1]);

			Arr.Push(markers, {
				bRange: true,
				StartMarker: startMarker[0],
				StartOffset: caret.Start.Offset,
				EndMarker: endMarker[0],
				EndOffset: caret.End.Offset,
			});
		});

		CaretUtils.Clean();

		return markers;
	};

	const applyCaretsByMarkers = (editor: Editor, markers: TCaretPath[]) => {
		const self = editor;
		const newRanges: IRangeUtils[] = [];

		const getTextOrBrNode = (parent: Node): Node => {
			if (DOM.Utils.IsText(parent)) return parent;

			let node = parent;
			while (node && !DOM.Utils.IsText(node) && !DOM.Utils.IsBr(node)) {
				node = self.DOM.GetChildNodes(node, false)[0];
			}

			return node;
		};

		const getMarkerSibling = (markerId: string, bPrevious: boolean = false): Node => {
			const marker = self.DOM.Select({
				id: markerId
			}, self.GetBody());

			const sibling = bPrevious ? marker.previousSibling : marker.nextSibling;

			if (sibling) {
				const siblingName = DOM.Utils.GetNodeName(sibling);
				if (BlockFormatTags.Figures.has(siblingName)) {
					if (siblingName !== FigureSelector) return sibling.parentNode as Element;
					return sibling;
				}

				return getTextOrBrNode(sibling);
			}

			let current: Node | null = marker;
			while (current && current !== self.GetBody()) {
				const currentSibling = bPrevious ? current.previousSibling : current.nextSibling;
				if (currentSibling) {
					current = currentSibling;
					break;
				}

				current = current.parentNode;
			}

			const currentName = DOM.Utils.GetNodeName(current);
			if (BlockFormatTags.Figures.has(currentName)) {
				if (currentName !== FigureSelector) return current?.parentNode as Element;
				return current as Element;
			}

			return getTextOrBrNode(!current ? marker : current);
		};

		Arr.Each(markers, marker => {
			const newRange = self.Utils.Range();

			if (!marker.bRange) {
				const markerNode = getMarkerSibling(marker.Marker);
				newRange.SetStartToEnd(markerNode, marker.Offset, marker.Offset);
				return Arr.Push(newRanges, newRange);
			}

			const startMarker = getMarkerSibling(marker.StartMarker);
			const endMarker = getMarkerSibling(marker.EndMarker, true);
			newRange.SetStart(startMarker, marker.StartOffset);
			newRange.SetEnd(endMarker, marker.EndOffset);
			Arr.Push(newRanges, newRange);
		});

		self.Utils.Caret.UpdateRanges(newRanges);

		const markerNodes = self.DOM.SelectAll({
			attrs: {
				marker: 'true',
			}
		}, self.GetBody());

		Arr.Each(markerNodes, marker => {
			let emptyMarker: Element | null = marker;
			while (emptyMarker?.parentElement && emptyMarker !== self.GetBody()) {
				if (DOM.GetChildNodes(emptyMarker.parentElement, false).length !== 1) break;

				emptyMarker = emptyMarker.parentElement;
			}

			self.DOM.Remove(emptyMarker ?? marker);
		});
	};

	const RunFormatting = (editor: Editor, toggle: () => void) => {
		const self = editor;
		const markers: TCaretPath[] = createMarkers(self);

		toggle();

		applyCaretsByMarkers(self, markers);
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

		const children = self.DOM.GetChildNodes(parent, false);
		const index = Arr.Find(children, node) + (bInsertedStartNode ? 1 : 0);
		parent.replaceChild(fragment, node);

		return children[index];
	};

	const GetStyleSelectorMap = (styles: Record<string, string>, value?: string): (string | Record<string, string>)[] => {
		const createdSelector: (string | Record<string, string>)[] = [];
		const selectorMap: Record<string, string> = {};
		Obj.Entries(styles, (styleName, styleValue) => {
			if (styleValue === '{{value}}') {
				if (!!value) selectorMap[styleName] = value;
				else Arr.Push(createdSelector, styleName);
				return;
			}

			selectorMap[styleName] = styleValue;
		});
		Arr.Push(createdSelector, selectorMap);

		return createdSelector;
	};

	const getNodesInRoot = (node: Node, root: Node, bPrevious: boolean = false): Node[] => {
		const nodes: Node[] = [];
		let currentNode: Node | null = node;

		const getSibling = (selector: Node): Node | null => bPrevious ? selector.previousSibling : selector.nextSibling;

		while (currentNode) {
			if (currentNode.parentNode === root && !getSibling(currentNode)) break;
			if (!getSibling(currentNode)) {
				currentNode = currentNode.parentNode;
				continue;
			}

			currentNode = getSibling(currentNode);
			if (currentNode) Arr.Push(nodes, currentNode);
		}

		return nodes;
	};

	const GetTableItems = (editor: Editor, bSelected: boolean, table?: Node): Node[] => {
		const self = editor;

		return self.DOM.SelectAll({
			tagName: [...TableCellSet],
			attrs: [Options.ATTRIBUTE_SELECTED],
			bNot: !bSelected,
		}, table);
	};

	const ExceptNodes = (editor: Editor, node: Node, root: Node, bPrevious: boolean = false): Node[] => {
		const self = editor;

		const tableNode = self.DOM.Closest(GetParentIfText(root), TableSelector);
		if (!!tableNode) {
			const nodes: Node[] = [];
			Arr.Push(nodes, ...GetTableItems(self, false, tableNode), ...getNodesInRoot(node, root, bPrevious));
			return nodes;
		}

		return getNodesInRoot(node, root, bPrevious);
	};

	const SerialiseWithProcessors = (editor: Editor, options: IProcessorOption) => {
		const self = editor;
		const CaretUtils = self.Utils.Caret;
		const { bWrap, value, tableProcessor, processors, afterProcessors } = options;

		if (tableProcessor(bWrap, value)) return;

		Arr.Each(CaretUtils.Get(), caret => {
			Arr.Each(processors, (option, exit) => {
				if (!option.processor(bWrap, caret, value)) return;
				if (!option.bSkipFocus) self.Focus();
				exit();
			});

			if (Type.IsFunction(afterProcessors)) afterProcessors(caret);
		});

		CaretUtils.Clean();
	};

	const CleanDirty = (editor: Editor, caret: ICaretData) => {
		const self = editor;

		const followingItemsSelector = Str.Join(',', ...BlockFormatTags.FollowingItems);
		const startBlock = self.DOM.Closest(GetParentIfText(caret.Start.Node), followingItemsSelector) ?? caret.Start.Path[0];
		const endBlock = self.DOM.Closest(GetParentIfText(caret.End.Node), followingItemsSelector) ?? caret.End.Path[0];
		const children: Node[] = [];

		const startBlockName = self.DOM.Utils.GetNodeName(startBlock);
		const endBlockName = self.DOM.Utils.GetNodeName(endBlock);

		const caretNodes = [
			...self.DOM.SelectAll({ attrs: 'caret' }, startBlock),
			...self.DOM.SelectAll({ attrs: 'caret' }, endBlock)
		];

		if (startBlockName !== FigureSelector) Arr.Push(children, ...self.DOM.GetChildNodes(startBlock));
		if (endBlockName !== FigureSelector) Arr.Push(children, ...self.DOM.GetChildNodes(endBlock));

		const isNodeEmpty = (target: Node): boolean =>
			(self.DOM.Utils.IsText(target) && Str.IsEmpty(target.textContent)) || (!self.DOM.Utils.IsText(target) && Str.IsEmpty(self.DOM.GetText(target as HTMLElement)));

		Arr.Each(children, child => {
			if (!child
				|| !isNodeEmpty(child)
				|| self.DOM.Utils.IsBr(child)
				|| (self.DOM.Utils.IsBr(self.DOM.GetChildNodes(child)[0]))
				|| self.DOM.HasAttr(child, 'caret')
				|| self.DOM.HasAttr(child, 'marker')
				|| self.DOM.Utils.GetNodeName(child) === FigureSelector
			) return;

			let bSkip = false;

			Arr.Each(caretNodes, (caretNode, exit) => {
				if (!self.DOM.Utils.IsChildOf(caretNode, child)) return;
				bSkip = true;
				exit();
			});

			if (bSkip) return;

			if (self.DOM.Utils.IsText(child)) return child.remove();
			self.DOM.Remove(child as Element, false);
		});
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
		GetStyleSelectorMap,
		GetTableItems,
		ExceptNodes,
		SerialiseWithProcessors,
		CleanDirty,
	};
};

export default FormatUtils();