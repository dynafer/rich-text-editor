import Editor from '../../Editor';

export interface IPartsToolAttacher<T = unknown> {
	(editor: Editor, element: HTMLElement, ...args: T[]): HTMLElement | null;
}