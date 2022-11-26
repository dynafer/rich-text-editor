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
	DIV = 'DIV',
}

export enum EFormatUIType {
	ICON = 'ICON',
	ICON_WRAP = 'ICON_WRAP',
	ITEM = 'ITEM',
	COLOR_ICON = 'COLOR_ICON',
	HELPER = 'HELPER',
}

export interface IFormatOptionBase {
	Type: EFormatType,
	Format: string,
	FormatValue?: string,
	SameOption?: string[],
}

export interface IFormatUIOptionBase extends IFormatOptionBase {
	Title: string,
}

export interface IFormatOption extends IFormatUIOptionBase {
	UIName: EFormatUI,
	UIType: string,
	Html: string,
}

export interface IFormatChecker {
	(node: Node): boolean;
}

export interface IToggleSetting<T extends Node = ParentNode> extends Pick<IFormatOptionBase, 'Type' | 'Format' | 'FormatValue'> {
	Parent: T,
	Checker: IFormatChecker,
}

export interface IFormattingOption extends Pick<IFormatOptionBase, 'Type' | 'Format'> {
	StyleFormat: string,
	Option: Record<string, TCreateOption>,
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