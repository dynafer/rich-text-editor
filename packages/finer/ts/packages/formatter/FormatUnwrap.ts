import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { EFormatType, IFormatChecker, IFormattingOption } from './FormatType';

interface IUnwrapSiblingNodes {
	PreviousNodes: Node[],
	MiddleNodes: Node[],
	NextNodes: Node[],
}

export interface IFormatUnwrap {
	UnwrapRecursive: (formatting: IFormattingOption, children: Node[], checker: IFormatChecker) => Node[],
	UnwrapSiblings: (wrapper: Node, alreadyAppendedNodes: Node[], old: IUnwrapSiblingNodes, checker: IFormatChecker) => IUnwrapSiblingNodes,
	UnwrapParents: (sameRoot: Node, unwrappedChildren: Node[], checker: IFormatChecker) => Node[],
}

const FormatUnwrap = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;

	const cloneNodes = (wrapper: Node, nodes: Node[]) => {
		const newNodes: Node[] = [];
		for (const node of nodes) {
			const clonedWrapper = DOM.Clone(wrapper, false, node);
			if (!clonedWrapper) continue;
			newNodes.push(clonedWrapper);
		}

		return newNodes;
	};

	const cloneNodesWithoutTagName = (wrapper: Node, nodes: Node[], checker: IFormatChecker) => {
		const bUnwrap: boolean = checker(wrapper);
		const newNodes: Node[] = [];
		for (const node of nodes) {
			if (bUnwrap) {
				newNodes.push(node);
				continue;
			}

			const clonedWrapper = DOM.Clone(wrapper, false, node);
			if (!clonedWrapper) continue;
			newNodes.push(clonedWrapper);
		}

		return newNodes;
	};

	const findTopWrappedNode = (paths: Node[], checker: IFormatChecker): Node | null => {
		let topWrappedNode: Node | null = null;
		for (const path of paths) {
			if (checker(path)) {
				topWrappedNode = path;
				break;
			}
		}

		return topWrappedNode;
	};

	const UnwrapRecursive = (formatting: IFormattingOption, children: Node[], checker: IFormatChecker): Node[] => {
		const { Type, Format, StyleFormat } = formatting;
		let nodes = [...children];
		for (let index = 0; index < nodes.length; ++index) {
			const child = nodes[index];

			if (checker(child)) {
				if (Type === EFormatType.STYLE && DOM.Utils.GetNodeName(child) === Format) {
					DOM.RemoveStyle(child as HTMLElement, StyleFormat);
					nodes = Arr.Merge(nodes.slice(0, index), (Str.IsEmpty(DOM.GetAttr(child, 'style')) ? Array.from(child.childNodes) : [child]), nodes.slice(index + 1, nodes.length));
					continue;
				}
				nodes = Arr.Merge(nodes.slice(0, index), Array.from(child.childNodes), nodes.slice(index + 1, nodes.length));
				continue;
			}

			if (!DOM.Utils.IsText(child))
				(child as HTMLElement).replaceChildren(...UnwrapRecursive(formatting, Array.from(child.childNodes), checker));
		}

		return nodes;
	};

	const UnwrapSiblings = (wrapper: Node, alreadyAppendedNodes: Node[], old: IUnwrapSiblingNodes, checker: IFormatChecker): IUnwrapSiblingNodes => {
		const siblings: Node[] = Array.from(wrapper.childNodes);
		const PreviousNodes: Node[] = cloneNodes(wrapper, old.PreviousNodes);
		const MiddleNodes: Node[] = cloneNodesWithoutTagName(wrapper, old.MiddleNodes, checker);
		const NextNodes: Node[] = cloneNodes(wrapper, old.NextNodes);
		let bNext = false;

		for (const sibling of siblings) {
			if (Arr.Contains(alreadyAppendedNodes, sibling)) {
				bNext = true;
				continue;
			}

			const clonedSibling = DOM.Clone(sibling, true);
			const clonedWrapper = DOM.Clone(wrapper, false, clonedSibling);
			if (!clonedSibling || !clonedWrapper) continue;
			if (Str.IsEmpty(DOM.GetText(clonedWrapper as HTMLElement))) continue;
			if (!bNext) PreviousNodes.push(clonedWrapper);
			else NextNodes.push(clonedWrapper);
		}

		return {
			PreviousNodes,
			MiddleNodes,
			NextNodes
		};
	};

	const UnwrapParents = (sameRoot: Node, unwrappedChildren: Node[], checker: IFormatChecker): Node[] => {
		const bRootText = DOM.Utils.IsText(sameRoot);
		const root = bRootText ? sameRoot.parentNode as Node : sameRoot;
		const parentPath = DOM.GetParents(sameRoot);
		const reversedPath = Arr.Reverse(parentPath);
		const siblings: Node[] = Array.from(root.childNodes).filter((sibling) => DOM.Utils.IsText(sibling) ? !Str.IsEmpty(sibling.textContent) : true);

		const unwrapStartIndex: number = Arr.CompareAndGetStartIndex(siblings, unwrappedChildren);
		const unwrapEndIndex: number = Arr.CompareAndGetEndIndex(siblings, unwrappedChildren);
		if (unwrapStartIndex === -1 || unwrapEndIndex === -1) return unwrappedChildren;

		const topUnwrappable: Node | null = findTopWrappedNode(parentPath, checker);
		if (!topUnwrappable) return unwrappedChildren;

		let PreviousNodes: Node[] = Arr.Reverse([...siblings.slice(0, unwrapStartIndex)]);
		if (unwrapStartIndex === 0) PreviousNodes = [];
		let MiddleNodes: Node[] = [...siblings.slice(unwrapStartIndex, unwrapEndIndex + 1)];
		let NextNodes: Node[] = [...siblings.slice(unwrapEndIndex + 1, siblings.length)];
		let alreadyAppendedNodes: Node[] = [...siblings];
		let bSkip: boolean = false;

		for (const path of reversedPath) {
			if (bSkip) break;
			if (path === topUnwrappable) bSkip = true;
			const unwrapped = UnwrapSiblings(
				path,
				alreadyAppendedNodes,
				{
					PreviousNodes,
					MiddleNodes,
					NextNodes
				},
				checker
			);

			PreviousNodes = unwrapped.PreviousNodes;
			MiddleNodes = unwrapped.MiddleNodes;
			NextNodes = unwrapped.NextNodes;
			alreadyAppendedNodes = [path];
		}

		PreviousNodes = Arr.Reverse(PreviousNodes);

		const mergedNewNodes = Arr.Merge(PreviousNodes, MiddleNodes, NextNodes);

		topUnwrappable.parentNode?.replaceChild(mergedNewNodes[0], topUnwrappable);
		DOM.InsertAfter(mergedNewNodes[0], mergedNewNodes.slice(1, mergedNewNodes.length));

		return [MiddleNodes[0], MiddleNodes[MiddleNodes.length - 1]];
	};

	return {
		UnwrapRecursive,
		UnwrapSiblings,
		UnwrapParents,
	};
};

export default FormatUnwrap;