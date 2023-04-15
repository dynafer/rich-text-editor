import { NodeType } from '@dynafer/dom-control';
import { Arr, Obj, Str, Type } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ICaretData } from '../editorUtils/caret/CaretUtils';
import { AllBlockFormats, BlockFormatTags } from './Format';

export type TConfigOption = string | string[] | Record<string, string>;

export type TFormatProcessor = (bWrap: boolean, caret: ICaretData, value?: string) => boolean;
export type TFormatProcessorWithValue = (bWrap: boolean, caret: ICaretData, value: string) => boolean;

export type TMarkerPath = {
	readonly bRange: false,
	readonly Marker: string,
	readonly Offset: number,
} | {
	readonly bRange: true,
	readonly StartMarker: string,
	readonly StartOffset: number,
	readonly EndMarker: string,
	readonly EndOffset: number,
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
	GetFormatConfig: (editor: Editor, defaultOptions: TConfigOption, configName: Capitalize<string>) => TConfigOption,
	LabelConfigArray: (config: string[]) => Record<string, string>,
	GetParentIfText: (node: Node) => Element,
	DoWithShallowMarking: (editor: Editor, caret: ICaretData, callback: () => void) => void,
	CleanDirty: (editor: Editor, nodes: Node[]) => void,
	CleanDirtyWithCaret: (editor: Editor, caret: ICaretData | null) => void,
	RunFormatting: (editor: Editor, toggle: () => void) => void,
	SplitTextNode: (editor: Editor, node: Node, start: number, end: number) => Node | null,
	GetStyleSelectorMap: (styles: Record<string, string>, value?: string) => (string | Record<string, string>)[],
	ExceptNodes: (editor: Editor, node: Node, root: Node, bPrevious?: boolean) => Node[],
	LeaveProcessorIfFigure: (editor: Editor, caret: ICaretData) => boolean,
	SerialiseWithProcessors: (editor: Editor, options: IProcessorOption) => void,
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

	const GetFormatConfig = (editor: Editor, defaultOptions: TConfigOption, configName: Capitalize<string>): TConfigOption => {
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

	const GetParentIfText = (node: Node): Element => (NodeType.IsText(node) ? node.parentElement : node) as Element;

	const DoWithShallowMarking = (editor: Editor, caret: ICaretData, callback: () => void) => {
		const self = editor;

		const startMarker = DOM.Create('span', { attrs: ['marker'] });
		const endMarker = DOM.Create('span', { attrs: ['marker'] });

		DOM.InsertBefore(caret.Start.Node, startMarker);
		DOM.InsertAfter(caret.End.Node, endMarker);

		callback();

		const newRange = self.Utils.Range();
		newRange.SetStart(startMarker.nextSibling as Element, caret.Start.Offset);
		newRange.SetEnd(endMarker.previousSibling as Element, caret.End.Offset);
		self.Utils.Caret.UpdateRange(newRange);

		DOM.Remove(startMarker);
		DOM.Remove(endMarker);
	};

	const CleanDirty = (editor: Editor, nodes: Node[]) => {
		const self = editor;

		const caretNodes = self.DOM.SelectAll({ attrs: 'caret' });

		const isNodeEmpty = (target: Node): boolean =>
			(NodeType.IsText(target) && Str.IsEmpty(target.textContent)) || (!NodeType.IsText(target) && Str.IsEmpty(DOM.GetText(target)));

		const isSkippable = (target: Node | null): boolean => {
			let result = !target
				|| DOM.Utils.IsBr(target)
				|| DOM.Utils.IsBr(DOM.Utils.GetFirstChild(target, true))
				|| DOM.HasAttr(target, 'caret')
				|| DOM.HasAttr(target, 'marker')
				|| DOM.Element.Figure.IsFigure(target)
				|| AllBlockFormats.has(DOM.Utils.GetNodeName(target));

			if (!target) return result;

			Arr.Each(caretNodes, (caretNode, exit) => {
				if (!DOM.Utils.IsChildOf(caretNode, target)) return;
				result = true;
				exit();
			});

			return result;
		};

		const cleanRecursive = (children: Node[]) =>
			Arr.Each(children, child => {
				if (isSkippable(child)) return;
				if (!NodeType.IsText(child)) cleanRecursive(DOM.GetChildNodes(child));
				if (!isNodeEmpty(child)) return;

				DOM.Remove(child, false);
			});

		cleanRecursive(nodes);

		const anchors = self.DOM.SelectAll<HTMLAnchorElement>('a');
		Arr.WhileShift(anchors, anchor => {
			const nextSibling = anchor.nextSibling;
			if (!nextSibling || !DOM.Utils.IsAnchor(nextSibling) || nextSibling.href !== anchor.href) return;

			DOM.Insert(anchor, ...DOM.GetChildNodes(nextSibling));
			Arr.FindAndRemove(anchors, nextSibling);
			DOM.Remove(nextSibling);
			Arr.Unshift(anchors, anchor);
		});
	};

	const CleanDirtyWithCaret = (editor: Editor, caret: ICaretData | null) => {
		if (!caret) return;

		const self = editor;

		const startParent = GetParentIfText(caret.Start.Node);
		const endParent = GetParentIfText(caret.End.Node);
		const blockSelector = Str.Join(',', ...BlockFormatTags.Block);
		const followingItemsSelector = Str.Join(',', ...BlockFormatTags.FollowingItems);
		const startBlock = DOM.Closest(startParent, blockSelector) ?? DOM.Closest(startParent, followingItemsSelector) ?? caret.Start.Path[0];
		const endBlock = DOM.Closest(endParent, blockSelector) ?? DOM.Closest(endParent, followingItemsSelector) ?? caret.End.Path[0];

		if (startBlock === endBlock) {
			if (DOM.Element.Figure.IsFigure(startBlock)) return;
			return CleanDirty(self, DOM.GetChildNodes(startBlock));
		}

		const children: Node[] = [];
		if (!DOM.Element.Figure.IsFigure(startBlock)) Arr.Push(children, ...DOM.GetChildNodes(startBlock));
		if (!DOM.Element.Figure.IsFigure(endBlock)) Arr.Push(children, ...DOM.GetChildNodes(endBlock));

		DoWithShallowMarking(self, caret, () => CleanDirty(self, children));
	};

	const createMarker = (editor: Editor): TMarkerPath | null => {
		const self = editor;
		if (!Arr.IsEmpty(DOM.Element.Table.GetSelectedCells(self))) return null;

		const caret = self.Utils.Caret.Get();
		if (!caret) return null;

		const create = (): [string, Node] => {
			const id = DOM.Utils.CreateUEID('marker');
			const marker = self.DOM.Create('span', {
				attrs: [
					{ id },
					'marker',
				]
			});

			return [id, marker];
		};

		const getChildOrCreateBr = (target: Node, bFirst: boolean): Node => {
			const getChild = bFirst ? DOM.Utils.GetFirstChild : DOM.Utils.GetLastChild;
			const child = getChild(target, true);
			if (child) return child;

			const brElement = self.DOM.Create('br');
			DOM.Insert(target, brElement);
			return brElement;
		};

		let startNode = caret.Start.Node;
		let endNode = caret.End.Node;
		const startNodeName = DOM.Utils.GetNodeName(startNode);
		const endNodeName = DOM.Utils.GetNodeName(endNode);

		if (BlockFormatTags.Figures.has(startNodeName) || BlockFormatTags.Figures.has(endNodeName)) {
			const newMarker = create();
			if (DOM.Element.Figure.IsFigure(startNode) || DOM.Element.Figure.IsFigure(endNode)) {
				const { FigureElement } = DOM.Element.Figure.Find(startNode);
				if (!FigureElement) return null;
				startNode = FigureElement;
			}

			DOM.InsertBefore(startNode, newMarker[1]);
			return {
				bRange: false,
				Marker: newMarker[0],
				Offset: 0,
			};
		}

		if (BlockFormatTags.Block.has(startNodeName)) startNode = getChildOrCreateBr(startNode, true);
		if (BlockFormatTags.Block.has(endNodeName)) endNode = getChildOrCreateBr(endNode, false);

		if (!caret.IsRange()) {
			const newMarker = create();
			DOM.InsertBefore(startNode, newMarker[1]);
			return {
				bRange: false,
				Marker: newMarker[0],
				Offset: caret.Start.Offset,
			};
		}

		const startMarker = create();
		const endMarker = create();

		DOM.InsertBefore(startNode, startMarker[1]);
		DOM.InsertAfter(endNode, endMarker[1]);

		return {
			bRange: true,
			StartMarker: startMarker[0],
			StartOffset: caret.Start.Offset,
			EndMarker: endMarker[0],
			EndOffset: caret.End.Offset,
		};
	};

	const applyCaretsByMarker = (editor: Editor, marker: TMarkerPath | null) => {
		if (!marker) return;
		const self = editor;

		const getTextOrBrNode = (parent: Node): Node => {
			if (NodeType.IsText(parent)) return parent;

			let node: Node | null = parent;
			while (node && !NodeType.IsText(node) && !DOM.Utils.IsBr(node)) {
				const firstChild = DOM.Utils.GetFirstChild(node);
				if (!firstChild) break;
				node = firstChild;
			}

			return node;
		};

		const getMarkerSibling = (markerId: string, bPrevious: boolean = false): Node => {
			const selector = self.DOM.Select({
				id: markerId
			});

			const sibling = bPrevious ? selector.previousSibling : selector.nextSibling;

			const getRelativeNode = (node: Node): Node => {
				if (!BlockFormatTags.Figures.has(DOM.Utils.GetNodeName(node))) return getTextOrBrNode(node);
				if (node.parentNode && !DOM.Element.Figure.IsFigure(node)) return node.parentNode;
				return node;
			};

			if (sibling) return getRelativeNode(sibling);

			let current: Node | null = selector;
			while (current && current !== self.GetBody()) {
				const currentSibling = bPrevious ? current.previousSibling : current.nextSibling;
				if (currentSibling) {
					current = currentSibling;
					break;
				}

				current = current.parentNode;
			}

			return !current ? getTextOrBrNode(selector) : getRelativeNode(current);
		};

		const newRange = self.Utils.Range();

		if (!marker.bRange) {
			const markerNode = getMarkerSibling(marker.Marker);
			newRange.SetStartToEnd(markerNode, marker.Offset, marker.Offset);
		} else {
			const startMarker = getMarkerSibling(marker.StartMarker);
			const endMarker = getMarkerSibling(marker.EndMarker, true);
			newRange.SetStart(startMarker, marker.StartOffset);
			newRange.SetEnd(endMarker, marker.EndOffset);
		}

		self.Utils.Caret.UpdateRange(newRange);

		const markerNodes = self.DOM.SelectAll({
			attrs: ['marker']
		});

		Arr.Each(markerNodes, markerNode => {
			let emptyMarker: Element | null = markerNode;
			while (emptyMarker?.parentElement && emptyMarker !== self.GetBody()) {
				if (DOM.GetChildNodes(emptyMarker.parentElement, false).length !== 1) break;

				emptyMarker = emptyMarker.parentElement;
			}

			DOM.Remove(emptyMarker ?? markerNode);
		});
	};

	const RunFormatting = (editor: Editor, toggle: () => void) => {
		const self = editor;
		const marker: TMarkerPath | null = createMarker(self);

		toggle();

		applyCaretsByMarker(self, marker);

		CleanDirtyWithCaret(self, self.Utils.Caret.Get());
	};

	const SplitTextNode = (editor: Editor, node: Node, start: number, end: number): Node | null => {
		if (!NodeType.IsText(node)) return null;

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

		const children = DOM.GetChildNodes(parent, false);
		const index = Arr.Find(children, node) + (bInsertedStartNode ? 1 : 0);
		parent.replaceChild(fragment, node);

		return children[index];
	};

	const GetStyleSelectorMap = (styles: Record<string, string>, value?: string): (string | Record<string, string>)[] => {
		const createdSelector: (string | Record<string, string>)[] = [];
		const selectorMap: Record<string, string> = {};
		Obj.Entries(styles, (styleName, styleValue) => {
			if (styleValue !== '{{value}}') {
				selectorMap[styleName] = styleValue;
				return;
			}

			if (!value) return Arr.Push(createdSelector, styleName);

			selectorMap[styleName] = value;
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

	const ExceptNodes = (editor: Editor, node: Node, root: Node, bPrevious: boolean = false): Node[] => {
		const self = editor;

		const tableNode = DOM.Element.Table.GetClosest(GetParentIfText(root));
		if (!!tableNode) {
			const nodes: Node[] = [];
			Arr.Push(nodes, ...DOM.Element.Table.GetSelectedCells(self, tableNode, false), ...getNodesInRoot(node, root, bPrevious));
			return nodes;
		}

		return getNodesInRoot(node, root, bPrevious);
	};

	const LeaveProcessorIfFigure = (editor: Editor, caret: ICaretData): boolean => {
		const self = editor;

		const element = GetParentIfText(caret.Start.Node);
		if (!DOM.Element.Figure.IsFigure(element)) return false;

		self.Utils.Shared.DispatchCaretChange([element]);
		return true;
	};

	const SerialiseWithProcessors = (editor: Editor, options: IProcessorOption) => {
		const self = editor;
		const CaretUtils = self.Utils.Caret;
		const { bWrap, value, tableProcessor, processors, afterProcessors } = options;
		self.Focus();

		if (tableProcessor(bWrap, value)) return;

		self.GetBody().normalize();

		const caret = CaretUtils.Get();
		if (!caret) return;

		if (LeaveProcessorIfFigure(self, caret)) return;

		Arr.Each(processors, (option, exit) => {
			if (!option.processor(bWrap, caret, value)) return;
			if (!option.bSkipFocus) self.Focus();
			exit();
		});

		if (Type.IsFunction(afterProcessors)) afterProcessors(caret);
		self.GetBody().normalize();
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
		DoWithShallowMarking,
		CleanDirty,
		CleanDirtyWithCaret,
		RunFormatting,
		SplitTextNode,
		GetStyleSelectorMap,
		ExceptNodes,
		LeaveProcessorIfFigure,
		SerialiseWithProcessors,
	};
};

export default FormatUtils();