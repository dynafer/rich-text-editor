import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { ICaretData } from '../editorUtils/CaretUtils';
import { IEvent } from '../editorUtils/EventUtils';

export interface IPluginManager {
	DetectByTagName: (tagName: string, activate: (bActive: boolean) => void) => void,
	DetectByStyle: (styleName: string, activate: (bActive: boolean) => void) => void,
	ApplyByTagName: (tagName: string) => void,
}

const PluginManager = (editor: Editor): IPluginManager => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;

	self.On('caret:change', ((paths: EventTarget[]) => {
		const caretPointers = DOM.SelectAll('[caret]');
		if (Arr.IsEmpty(caretPointers)) return;

		const currentCarets: Node[] = [];
		for (const path of paths) {
			if (DOM.HasAttr(path as Node, 'caret')) currentCarets.push(path as Node);
		}

		for (const caretPointer of caretPointers) {
			if (currentCarets.includes(caretPointer)) continue;

			if (Str.IsEmpty(DOM.GetInnerText(caretPointer))) {
				caretPointer.remove();
			} else {
				caretPointer.replaceWith(caretPointer.children[0]);
			}
		}
	}) as IEvent);

	const DetectByTagName = (tagName: string, activate: (bActive: boolean) => void) => {
		self.On('caret:change', ((paths: EventTarget[]) => {
			const carets: ICaretData[] = CaretUtils.Get();

			for (const caret of carets) {
				if (!caret.IsSameLine()) {
					paths = Arr.UniqueMerge(paths, caret.Start.Path, caret.End.Path);
				}
			}

			for (const path of paths) {
				if (DOM.GetTagName(path as Node) === tagName) {
					activate(true);
					return;
				}
			}

			activate(false);
		}) as IEvent);
	};

	const DetectByStyle = (styleName: string, activate: (bActive: boolean) => void) => {
		self.On('caret:change', ((carets: ICaretData[]) => {
			let mergedPath: Node[] = [];

			for (const caret of carets) {
				mergedPath = Arr.UniqueMerge(mergedPath, caret.Start.Path, caret.End.Path);
			}

			for (const path of mergedPath) {
				if (DOM.HasStyle(path as HTMLElement, styleName)) {
					activate(true);
					return;
				}
			}

			activate(false);
		}) as IEvent);
	};

	const wrap = (tagName: string, children: Node[]): Node[] => {
		const nodes = [ ...children ];
		for (let index = 0; index < nodes.length; ++ index) {
			const child = nodes[index];

			if (DOM.Utils.IsText(child)) {
				const newTag = DOM.Create(tagName);
				DOM.Insert(newTag, child.cloneNode(true));

				nodes[index] = newTag;

				continue;
			}

			if (DOM.Utils.GetNodeName(child) !== tagName) {
				(child as HTMLElement).replaceChildren(...wrap(tagName, Array.from(child.childNodes)));
			}
		}

		return nodes;
	};

	const findAndWrap = (tagName: string, caret: ICaretData): Range => {
		const fragment = caret.Range.extractContents();
		let startNode: Node;
		let endNode: Node;

		if (caret.IsSameLine()) {
			const replacer = wrap(tagName, Array.from(fragment.childNodes));

			fragment.replaceChildren(...replacer);
			const newNodes = Array.from(fragment.childNodes);

			caret.Range.insertNode(fragment);

			startNode = newNodes[0];
			endNode = newNodes[newNodes.length - 1];
		} else {
			const children: Node[] = Array.from(fragment.childNodes);
			const lines = self.GetBody().children;

			const startChildren = wrap(tagName, Array.from(children[0].childNodes));
			DOM.Insert(lines[caret.Start.Line], startChildren);
			startNode = startChildren[0];

			let nextLine: Node = lines[caret.Start.Line];
			for (let index = 1, length = children.length - 1; index < length; ++ index) {
				const child = children[index];
				const replacer = wrap(tagName, Array.from(child.childNodes));
				(child as Element).replaceChildren(...replacer);
				DOM.InsertAfter(nextLine, child);
				nextLine = child;
			}

			const endChildren = wrap(tagName, Array.from(children[children.length - 1].childNodes));
			const replaceChildren: Node[] = Array.from(lines[caret.End.Line].childNodes);
			replaceChildren.unshift(...endChildren);

			lines[caret.End.Line].replaceChildren(...replaceChildren);
			endNode = endChildren[endChildren.length - 1];
		}

		caret.Range.setStart(startNode, 0);
		caret.Range.setEndAfter(endNode);

		return caret.Range.cloneRange();
	};

	const ApplyByTagName = (tagName: string) => {
		const carets: ICaretData[] = CaretUtils.Get(true);
		const newRanges: Range[] = [];
		const caretId = DOM.Utils.CreateUEID('caret', false);

		for (let index = 0, length = carets.length; index < length; ++ index) {
			const caret = carets[index];
			if (caret.IsRange() || carets.length > 1) {
				newRanges.push(findAndWrap(tagName, caret));
				continue;
			}

			const caretPointer = DOM.Create('span', {
				attrs: {
					id: caretId,
					caret: index.toString()
				},
				html: DOM.Utils.CreateEmptyHTML(tagName)
			});

			caret.Range.insertNode(caretPointer);
			caret.Range.setStartAfter(caretPointer);

			newRanges.push(caret.Range.cloneRange());
		}

		CaretUtils.UpdateRanges(newRanges);
	};

	return {
		DetectByTagName,
		DetectByStyle,
		ApplyByTagName
	};
};

export default PluginManager;