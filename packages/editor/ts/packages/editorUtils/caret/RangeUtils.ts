import { NodeType } from '@dynafer/dom-control';

export interface IRangeUtils {
	Get: () => Range,
	GetRect: () => DOMRect,
	Insert: (node: Node) => void,
	Extract: () => DocumentFragment,
	CloneContents: () => DocumentFragment,
	DeleteContents: () => void,
	Clone: () => IRangeUtils,
	SetStart: (node: Node, offset: number) => void,
	SetStartBefore: (node: Node) => void,
	SetStartAfter: (node: Node) => void,
	SetEnd: (node: Node, offset: number) => void,
	SetEndBefore: (node: Node) => void,
	SetEndAfter: (node: Node) => void,
	Select: (node: Node) => void,
	SelectContents: (node: Node) => void,
	SetStartToEnd: (node: Node | null, startOffset: number, endOffset: number) => void,
}

const RangeUtils = (range: Range = new Range()): IRangeUtils => {
	const getOffset = (node: Node, offset: number): number => {
		if (!NodeType.IsText(node)) return offset;
		if (node.length < offset) return node.length;
		if (offset < 0) return 0;
		return offset;
	};

	const Get = (): Range => range;
	const GetRect = (): DOMRect => range.getBoundingClientRect();
	const Insert = (node: Node) => range.insertNode(node);
	const Extract = (): DocumentFragment => range.extractContents();
	const CloneContents = (): DocumentFragment => range.cloneContents();
	const DeleteContents = () => range.deleteContents();
	const Clone = (): IRangeUtils => RangeUtils(range.cloneRange());
	const SetStart = (node: Node, offset: number) => range.setStart(node, getOffset(node, offset));
	const SetStartBefore = (node: Node) => range.setStartBefore(node);
	const SetStartAfter = (node: Node) => range.setStartAfter(node);
	const SetEnd = (node: Node, offset: number) => range.setEnd(node, getOffset(node, offset));
	const SetEndBefore = (node: Node) => range.setEndBefore(node);
	const SetEndAfter = (node: Node) => range.setEndAfter(node);
	const Select = (node: Node) => range.selectNode(node);
	const SelectContents = (node: Node) => range.selectNodeContents(node);
	const SetStartToEnd = (node: Node | null, startOffset: number, endOffset: number) => {
		if (!node) return;
		SetStart(node, startOffset);
		SetEnd(node, endOffset);
	};

	return {
		Get,
		GetRect,
		Insert,
		Extract,
		CloneContents,
		DeleteContents,
		Clone,
		SetStart,
		SetStartBefore,
		SetStartAfter,
		SetEnd,
		SetEndBefore,
		SetEndAfter,
		Select,
		SelectContents,
		SetStartToEnd
	};
};

export default RangeUtils;