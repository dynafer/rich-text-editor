import Editor from '../../Editor';

export interface IDOMToolsPartAttacher<T = unknown> {
	(editor: Editor, element: HTMLElement, ...args: T[]): HTMLElement | null;
}