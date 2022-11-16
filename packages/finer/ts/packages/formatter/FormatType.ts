import { TCreateOption } from '../dom/DOM';

export const ACTIVE_CLASS = 'active';
export const ATTRIBUTE_TITLE = 'title';
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
	COLOR_ICON = 'COLOR_ICON',
}

export interface IFormatOptionBase {
	type: EFormatType,
	format: string,
	formatValue?: string,
	sameOption?: string[],
}

export interface IFormatUIOptionBase extends IFormatOptionBase {
	label: string,
}

export interface IFormatOption extends IFormatUIOptionBase {
	ui: EFormatUI,
	uiType: string,
	html: string,
}

export interface IFormatChecker {
	(node: Node): boolean
}

export interface IToggleSetting<T extends Node = ParentNode> extends Pick<IFormatOptionBase, 'type' | 'format' | 'formatValue'> {
	parent: T,
	checker: IFormatChecker,
}

export interface IFormattingOption extends Pick<IFormatOptionBase, 'type' | 'format'> {
	styleFormat: string,
	option: Record<string, TCreateOption>,
}

export interface IFormatRegistryJoiner {
	Formats: string[],
	Register: (name: string) => void,
}

export interface IFormatDetectorActivator {
	(detectedNode: Node | null): void;
}

export interface IFormatConfiguration {
	fontsize?: string[] | Record<string, string>,
	fontfamily?: string[] | Record<string, string>,
}