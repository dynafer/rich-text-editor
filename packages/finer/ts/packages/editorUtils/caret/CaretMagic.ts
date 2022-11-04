import { Arr, Str } from '@dynafer/utils';
import Editor from '../../Editor';

interface IToggleOneLineCallback<T extends Node = ParentNode> {
	(parent: T): void;
}

interface IToggleRangeCallback {
	(firstNodes: Node[], middleNodes: Node[], lastNodes: Node[]): void;
}

interface IToggleSetting<T extends Node = ParentNode> {
	bWrap: boolean,
	tagName: string,
	parent: T
}

interface IToggleOneLine {
	<T extends ParentNode>(tagName: string, parent: T, callback: IToggleOneLineCallback<T>): T;
	(tagName: string, parent: ParentNode, callback: IToggleOneLineCallback): ParentNode;
}

interface IToggleRange {
	<T extends ParentNode>(tagName: string, parent: T, callback: IToggleRangeCallback): T;
	(tagName: string, parent: ParentNode, callback: IToggleRangeCallback): ParentNode;
}

interface IUnwrapSiblingNodes {
	previousNodes: Node[],
	middleNodes: Node[],
	nextNodes: Node[]
}

export interface ICaretMagic {
	WrapOneLineRange: IToggleOneLine,
	WrapRange: IToggleRange,
	UnwrapOneLineRange: IToggleOneLine,
	UnwrapRange: IToggleRange,
	UnwrapParents: (tagName: string, sameRoot: Node, unwrappedChildren: Node[]) => Node[],
}

const CaretMagic = (editor: Editor): ICaretMagic => {
	const self = editor;
	const DOM = self.DOM;

	const wrapRecursive = (tagName: string, children: Node[]): Node[] => {
		const nodes = [ ...children ];
		for (let index = 0; index < nodes.length; ++ index) {
			const child = nodes[index];

			if (DOM.Utils.IsText(child)) {
				const newTag = DOM.Create(tagName, {
					children: [ DOM.Clone(child, true) ]
				});

				nodes[index] = newTag;

				continue;
			}

			if (DOM.Utils.GetNodeName(child) !== tagName) {
				(child as HTMLElement).replaceChildren(...wrapRecursive(tagName, Array.from(child.childNodes)));
			}
		}

		return nodes;
	};

	const unwrapRecursive = (tagName: string, children: Node[]): Node[] => {
		let nodes = [ ...children ];
		for (let index = 0; index < nodes.length; ++ index) {
			const child = nodes[index];

			if (DOM.Utils.GetNodeName(child) === tagName) {
				nodes = Arr.Merge(nodes.slice(0, index), Array.from(child.childNodes), nodes.slice(index + 1, nodes.length));
				continue;
			}

			if (!DOM.Utils.IsText(child)) {
				(child as HTMLElement).replaceChildren(...unwrapRecursive(tagName, Array.from(child.childNodes)));
			}
		}

		return nodes;
	};

	const toggleOneLineRange = (setting: IToggleSetting, callback: IToggleOneLineCallback): ParentNode => {
		const bWrap = setting.bWrap;
		const tagName = setting.tagName;
		const parent = setting.parent;
		const wrapOrUnwrap = bWrap ? wrapRecursive : unwrapRecursive;

		const children: Node[] = Array.from(parent.childNodes);
		const replacer = wrapOrUnwrap(tagName, children);

		parent.replaceChildren(...replacer);

		callback(parent);

		return parent;
	};

	const toggleRange = (setting: IToggleSetting, callback: IToggleRangeCallback): ParentNode => {
		const bWrap = setting.bWrap;
		const tagName = setting.tagName;
		const parent = setting.parent;
		const wrapOrUnwrap = bWrap ? wrapRecursive : unwrapRecursive;

		const children: Node[] = Array.from(parent.childNodes);

		const firstNodes = wrapOrUnwrap(tagName, Array.from(children[0].childNodes));
		const middleNodes: Node[] = [];
		const lastNodes = wrapOrUnwrap(tagName, Array.from(children[children.length - 1].childNodes));

		for (let index = 1, length = children.length - 1; index < length; ++ index) {
			toggleOneLineRange({ bWrap, tagName, parent: children[index] as ParentNode }, (wrapped) => {
				middleNodes.push(wrapped);
			});
		}

		callback(firstNodes, middleNodes, lastNodes);

		return parent;
	};

	const wrapNodes = (wrapper: Node, nodes: Node[]) => {
		const newNodes: Node[] = [];
		for (const node of nodes) {
			const clonedWrapper = DOM.Clone(wrapper, false, node);
			if (!clonedWrapper) continue;
			newNodes.push(clonedWrapper);
		}

		return newNodes;
	};

	const wrapNodesWithoutTagName = (tagName: string, wrapper: Node, nodes: Node[]) => {
		const bUnwrap: boolean = DOM.Utils.GetNodeName(wrapper) === tagName;
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

	const unwrapSiblings = (tagName: string, wrapper: Node, alreadyAppendedNodes: Node[], old: IUnwrapSiblingNodes) => {
		const siblings: Node[] = Array.from(wrapper.childNodes);
		const previousNodes: Node[] = wrapNodes(wrapper, old.previousNodes);
		const middleNodes: Node[] = wrapNodesWithoutTagName(tagName, wrapper, old.middleNodes);
		const nextNodes: Node[] = wrapNodes(wrapper, old.nextNodes);
		let bNext = false;

		if (siblings.length > 1) {
			for (const sibling of siblings) {
				if (alreadyAppendedNodes.includes(sibling)) {
					bNext = true;
					continue;
				}

				const clonedSibling = DOM.Clone(sibling, false);
				const clonedWrapper = DOM.Clone(wrapper, false, clonedSibling);
				if (!clonedSibling || !clonedWrapper) continue;
				if (!bNext) previousNodes.push(clonedWrapper);
				else nextNodes.push(clonedWrapper);
			}
		}

		return {
			previousNodes,
			middleNodes,
			nextNodes
		};
	};

	const findTopWrappedNode = (tagName: string, paths: Node[]): Node | null => {
		let topWrappedNode: Node | null = null;
		for (const path of paths) {
			if (DOM.Utils.GetNodeName(path) === tagName) {
				topWrappedNode = path;
				break;
			}
		}
		return topWrappedNode;
	};

	const WrapOneLineRange = (tagName: string, parent: ParentNode, callback: IToggleOneLineCallback): ParentNode =>
		toggleOneLineRange({ bWrap: true, tagName, parent }, callback);

	const WrapRange = (tagName: string, parent: ParentNode, callback: IToggleRangeCallback): ParentNode =>
		toggleRange({ bWrap: true, tagName, parent }, callback);

	const UnwrapOneLineRange = (tagName: string, parent: ParentNode, callback: IToggleOneLineCallback): ParentNode =>
		toggleOneLineRange({ bWrap: false, tagName, parent }, callback);

	const UnwrapRange = (tagName: string, parent: ParentNode, callback: IToggleRangeCallback): ParentNode =>
		toggleRange({ bWrap: false, tagName, parent }, callback);

	const UnwrapParents = (tagName: string, sameRoot: Node, unwrappedChildren: Node[]): Node[] => {
		const bRootText = DOM.Utils.IsText(sameRoot);
		const root = bRootText ? sameRoot.parentNode as Node : sameRoot;
		const parentPath = DOM.GetParents(sameRoot);
		const reversedPath = Arr.Reverse(parentPath);
		const siblings: Node[] = Array.from(root.childNodes).filter((sibling) => DOM.Utils.IsText(sibling) ? !Str.IsEmpty(sibling.textContent) : true);

		const unwrapStartIndex: number = Arr.CompareAndGetStartIndex(siblings, unwrappedChildren);
		const unwrapEndIndex: number = Arr.CompareAndGetEndIndex(siblings, unwrappedChildren);
		if (unwrapStartIndex === -1 || unwrapEndIndex === -1) return unwrappedChildren;

		const topUnwrappable: Node | null = findTopWrappedNode(tagName, parentPath);
		if (!topUnwrappable) return unwrappedChildren;

		let previousNodes: Node[] = [...siblings.slice(0, unwrapStartIndex)];
		if (unwrapStartIndex === 0) previousNodes = [];
		let middleNodes: Node[] = [...siblings.slice(unwrapStartIndex, unwrapEndIndex + 1)];
		let nextNodes: Node[] = [...siblings.slice(unwrapEndIndex + 1, siblings.length)];
		let alreadyAppendedNodes: Node[] = [...siblings];
		let bSkip: boolean = false;

		for (const path of reversedPath) {
			if (bSkip) break;
			if (path === topUnwrappable) bSkip = true;
			const unwrapped = unwrapSiblings(
				tagName,
				path,
				alreadyAppendedNodes,
				{
					previousNodes,
					middleNodes,
					nextNodes
				}
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
		WrapOneLineRange,
		WrapRange,
		UnwrapOneLineRange,
		UnwrapRange,
		UnwrapParents,
	};
};

export default CaretMagic;