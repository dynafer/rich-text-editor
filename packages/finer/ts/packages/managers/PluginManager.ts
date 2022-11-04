import { Arr, Str } from '@dynafer/utils';
import Editor from '../Editor';
import { IEvent } from '../editorUtils/EventUtils';
import { ICaretData } from '../editorUtils/caret/CaretUtils';

export interface IPluginManager {
	DetectByTagName: (tagName: string, activate: (bActive: boolean) => void) => void,
	DetectByStyle: (styleName: string, activate: (bActive: boolean) => void) => void,
	ApplyByTagName: (tagName: string) => void,
	ReleaseByTagName: (tagName: string) => void,
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
				paths = Arr.UniqueMerge(paths, caret.Start.Path, caret.End.Path);
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

	const toggle = (bWrap: boolean, tagName: string, caret: ICaretData): Range => {
		const fragment = caret.Range.extractContents();

		if (caret.IsSameLine()) {
			const wrapOrUnwrap = bWrap ? CaretUtils.Magic.WrapOneLineRange : CaretUtils.Magic.UnwrapOneLineRange;

			wrapOrUnwrap(tagName, fragment, (parent) => {
				let children: Node[] = Array.from(parent.childNodes);
				caret.Range.insertNode(parent);
				if (!bWrap) children = CaretUtils.Magic.UnwrapParents(tagName, caret.SameRoot, children);
				caret.Range.setStartBefore(children[0]);
				caret.Range.setEndAfter(children[children.length - 1]);
			});
		} else {
			const wrapOrUnwrap = bWrap ? CaretUtils.Magic.WrapRange : CaretUtils.Magic.UnwrapRange;

			wrapOrUnwrap(tagName, fragment, (firstNodes, middleNodes, lastNodes) => {
				const lines = self.GetBody().children;
				let nextLine: Node = lines[caret.Start.Line];
				DOM.Insert(lines[caret.Start.Line], firstNodes);
				for (const node of middleNodes) {
					DOM.InsertAfter(nextLine, node);
					nextLine = node;
				}
				lines[caret.End.Line].replaceChildren(...lastNodes, ...Array.from(lines[caret.End.Line].childNodes));
				caret.Range.setStart(firstNodes[0], 0);
				caret.Range.setEndAfter(lastNodes[lastNodes.length - 1]);
			});
		}

		return caret.Range.cloneRange();
	};

	const toggleByTagName = (bWrap: boolean, tagName: string) => {
		const carets: ICaretData[] = CaretUtils.Get(true);
		const newRanges: Range[] = [];
		const caretId = DOM.Utils.CreateUEID('caret', false);

		for (let index = 0, length = carets.length; index < length; ++ index) {
			const caret = carets[index];

			if (caret.IsRange() || carets.length > 1) {
				newRanges.push(toggle(bWrap, tagName, caret));
				continue;
			}

			const caretPointer = DOM.Create('span', {
				attrs: {
					id: caretId,
					caret: index.toString()
				}
			});

			DOM.Insert(caretPointer, DOM.Utils.CreateEmptyHTML(bWrap ? tagName : undefined));

			caret.Range.insertNode(caretPointer);
			caret.Range.setStartAfter(caretPointer);

			newRanges.push(caret.Range.cloneRange());
		}

		CaretUtils.UpdateRanges(newRanges);
	};

	const ApplyByTagName = (tagName: string) => toggleByTagName(true, tagName);
	const ReleaseByTagName = (tagName: string) => toggleByTagName(false, tagName);

	return {
		DetectByTagName,
		DetectByStyle,
		ApplyByTagName,
		ReleaseByTagName
	};
};

export default PluginManager;