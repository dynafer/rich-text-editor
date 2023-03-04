export interface IRangeUtils {
	Get: () => Range,
	GetRect: () => DOMRect,
	Insert: (node: Node) => void,
	Extract: () => DocumentFragment,
	DeleteContents: () => void,
	Clone: () => Range,
	SetStart: (node: Node, offset: number) => void,
	SetStartBefore: (node: Node) => void,
	SetStartAfter: (node: Node) => void,
	SetEnd: (node: Node, offset: number) => void,
	SetEndBefore: (node: Node) => void,
	SetEndAfter: (node: Node) => void,
	Select: (node: Node) => void,
	SelectContents: (node: Node) => void,
	SetStartToEnd: (node: Node, startOffset: number, endOffset: number) => void,
}

const RangeUtils = (range: Range = new Range()): IRangeUtils => {
	const Get = (): Range => range;
	const GetRect = (): DOMRect => range.getBoundingClientRect();
	const Insert = (node: Node) => range.insertNode(node);
	const Extract = (): DocumentFragment => range.extractContents();
	const DeleteContents = () => range.deleteContents();
	const Clone = (): Range => range.cloneRange();
	const SetStart = (node: Node, offset: number) => range.setStart(node, offset);
	const SetStartBefore = (node: Node) => range.setStartBefore(node);
	const SetStartAfter = (node: Node) => range.setStartAfter(node);
	const SetEnd = (node: Node, offset: number) => range.setEnd(node, offset);
	const SetEndBefore = (node: Node) => range.setEndBefore(node);
	const SetEndAfter = (node: Node) => range.setEndAfter(node);
	const Select = (node: Node) => range.selectNode(node);
	const SelectContents = (node: Node) => range.selectNodeContents(node);
	const SetStartToEnd = (node: Node, startOffset: number, endOffset: number) => {
		SetStart(node, startOffset);
		SetEnd(node, endOffset);
	};

	return {
		Get,
		GetRect,
		Insert,
		Extract,
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