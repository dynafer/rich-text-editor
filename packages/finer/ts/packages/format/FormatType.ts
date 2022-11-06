import { TCreateOption } from '../dom/DOM';

export enum EFormatType {
	tag = 'tag',
	style = 'style',
}

export enum EFormatUI {
	button = 'button',
}

export interface IFormatBase {
	type: EFormatType,
	format: string,
	formatValue?: string,
}

export interface IFormat<K extends keyof GlobalEventHandlersEventMap | string = string> extends IFormatBase {
	ui: EFormatUI,
	uiType: string,
	uiEvent: K,
	html: string
}

export interface IFormatChecker {
	(node: Node): boolean
}

export interface IToggleSetting<T extends Node = ParentNode> extends IFormatBase {
	parent: T,
	checker: IFormatChecker,
}

export interface IFormattingOption {
	format: string,
	option: Record<string, TCreateOption>,
}
