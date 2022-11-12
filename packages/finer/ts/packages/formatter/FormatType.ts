import { TCreateOption } from '../dom/DOM';

export const ACTIVE_CLASS = 'active';
export const ATTRIBUTE_DATA_VALUE = 'data-value';
export const STANDARD_POINTS_FROM_PIXEL = 0.75;
export const STANDARD_PIXEL_FROM_POINTS = 1 / STANDARD_POINTS_FROM_PIXEL;

export enum EFormatType {
	TAG = 'TAG',
	STYLE = 'STYLE',
}

export enum EFormatUI {
	BUTTON = 'BUTTON',
	LI = 'LI',
}

export enum EFormatUIType {
	ICON = 'ICON',
	ITEM = 'ITEM',
}

export interface IFormatOptionBase {
	type: EFormatType,
	format: string,
	formatValue?: string,
}

export interface IFormatOption<K extends keyof GlobalEventHandlersEventMap | string = string> extends IFormatOptionBase {
	ui: EFormatUI,
	uiType: string,
	uiEvent: K,
	html: string
}

export interface IFormatChecker {
	(node: Node): boolean
}

export interface IToggleSetting<T extends Node = ParentNode> extends IFormatOptionBase {
	parent: T,
	checker: IFormatChecker,
}

export interface IFormattingOption {
	format: string,
	option: Record<string, TCreateOption>,
}

export interface IFormatRegistryJoiner {
	Formats: string[],
	Register: (name: string) => void,
}

export interface IFormatDetectorActivator {
	(bActive: boolean, detected: string): void;
}

export interface IFormatConfiguration {
	fontsize?: string[] | Record<string, string>,
	fontfamily?: string[] | Record<string, string>,
}