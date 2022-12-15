import { Arr } from '@dynafer/utils';

const ToggleUtils = () => {
	const ExceptNodes = (node: Node, root: Node, bPrevious: boolean = false): Node[] => {
		const exceptions: Node[] = [];
		let currentNode: Node | null = node;

		const getSibling = (selector: Node): Node | null => bPrevious ? selector.previousSibling : selector.nextSibling;

		while (currentNode) {
			if (currentNode.parentNode === root && !getSibling(currentNode)) break;
			if (!getSibling(currentNode)) {
				currentNode = currentNode.parentNode;
				continue;
			}

			currentNode = getSibling(currentNode);
			if (currentNode) Arr.Push(exceptions, currentNode);
		}

		return exceptions;
	};

	return {
		ExceptNodes,
	};
};

export default ToggleUtils();