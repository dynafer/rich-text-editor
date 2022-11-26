import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { EFormatType, IFormatChecker, IFormattingOption } from './FormatType';

interface IUnwrapSiblingNodes {
	previousNodes: Node[],
	middleNodes: Node[],
	nextNodes: Node[],
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
		let nodes = [...children];
		for (let index = 0; index < nodes.length; ++index) {
			const child = nodes[index];

			if (checker(child)) {
				if (formatting.type === EFormatType.STYLE && DOM.Utils.GetNodeName(child) === formatting.format) {
					DOM.RemoveStyle(child as HTMLElement, formatting.styleFormat);
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
		const previousNodes: Node[] = cloneNodes(wrapper, old.previousNodes);
		const middleNodes: Node[] = cloneNodesWithoutTagName(wrapper, old.middleNodes, checker);
		const nextNodes: Node[] = cloneNodes(wrapper, old.nextNodes);
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
			if (!bNext) previousNodes.push(clonedWrapper);
			else nextNodes.push(clonedWrapper);
		}

		return {
			previousNodes,
			middleNodes,
			nextNodes
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

		let previousNodes: Node[] = Arr.Reverse([...siblings.slice(0, unwrapStartIndex)]);
		if (unwrapStartIndex === 0) previousNodes = [];
		let middleNodes: Node[] = [...siblings.slice(unwrapStartIndex, unwrapEndIndex + 1)];
		let nextNodes: Node[] = [...siblings.slice(unwrapEndIndex + 1, siblings.length)];
		let alreadyAppendedNodes: Node[] = [...siblings];
		let bSkip: boolean = false;

		for (const path of reversedPath) {
			if (bSkip) break;
			if (path === topUnwrappable) bSkip = true;
			const unwrapped = UnwrapSiblings(
				path,
				alreadyAppendedNodes,
				{
					previousNodes,
					middleNodes,
					nextNodes
				},
				checker
			);

			previousNodes = unwrapped.previousNodes;
			middleNodes = unwrapped.middleNodes;
			nextNodes = unwrapped.nextNodes;
			alreadyAppendedNodes = [path];
		}

		previousNodes = Arr.Reverse(previousNodes);

		const mergedNewNodes = Arr.Merge(previousNodes, middleNodes, nextNodes);

		topUnwrappable.parentNode?.replaceChild(mergedNewNodes[0], topUnwrappable);
		DOM.InsertAfter(mergedNewNodes[0], mergedNewNodes.slice(1, mergedNewNodes.length));

		return [middleNodes[0], middleNodes[middleNodes.length - 1]];
	};

	return {
		UnwrapRecursive,
		UnwrapSiblings,
		UnwrapParents,
	};
};

export default FormatUnwrap;