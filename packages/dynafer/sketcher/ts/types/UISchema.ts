import { IDOMFactory } from '../dom/DOMFactory';

export interface IUISchemaBase<K> {
	Schema: IDOMFactory,
	Self: IDOMFactory<K>,
}

export interface IInputSchema extends IUISchemaBase<HTMLInputElement> {
	GetValue: () => string,
	SetValue: (value: string) => void,
}

export interface IModalSchema extends IUISchemaBase<HTMLElement> {
	Header: IDOMFactory,
	Body: IDOMFactory,
	Footer: IDOMFactory,
}

export interface IPaletteSchema extends IUISchemaBase<HTMLElement> {
	Self: IDOMFactory<HTMLCanvasElement>,
	CreateGradient: (x0: number, y0: number, x1: number, y1: number) => CanvasGradient,
	ColorStop: (gradient: CanvasGradient, stops: [number, string][]) => void,
	Fill: (style: string | CanvasGradient | CanvasPattern) => void,
	FillRect: (style: string | CanvasGradient | CanvasPattern) => void,
	GetRGB: (x: number, y: number) => [number, number, number],
}

export interface IPaletteGuideSchema extends IUISchemaBase<HTMLElement> {
	GetX: () => number,
	GetY: () => number,
	SetGuidance: (x: number, y: number) => void,
}

export interface IUISchemaMap {
	Input: IInputSchema,
	Modal: IModalSchema,
	Palette: IPaletteSchema,
	PaletteGuide: IPaletteGuideSchema,
}
