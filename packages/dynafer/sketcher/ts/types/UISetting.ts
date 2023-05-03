import DOMFactory from '../dom/DOMFactory';

export interface ISketcherSetting<T extends HTMLElement = HTMLElement> {
	TagName: string,
	Attributes?: Record<string, string>,
	Classes?: string[],
	Events?: [string, EventListener][],
	Elements?: (string | DOMFactory<T> | ISketcherSetting)[],
}

export interface IModalSetting<T extends HTMLElement = HTMLElement> extends Pick<ISketcherSetting, 'Events'> {
	Title: string,
	Icons: Record<string, string>,
	Body?: DOMFactory<T> | DOMFactory[],
	Footer?: DOMFactory<T> | DOMFactory[],
}

export interface IInputSetting extends Pick<ISketcherSetting, 'Events'> {
	Label?: string,
	Placeholder?: string,
	Value?: string,
}

export interface IPaletteSetting extends Pick<ISketcherSetting, 'Events'> {
	Width: number,
	Height: number,
}

export interface IPaletteGuideSetting extends Pick<ISketcherSetting, 'Events'> {
	Palette: DOMFactory<HTMLCanvasElement>,
	bOnlyVertical: boolean,
	Guiding: () => void,
}

export interface IUISettingMap {
	Input: IInputSetting,
	Modal: IModalSetting,
	Palette: IPaletteSetting,
	PaletteGuide: IPaletteGuideSetting,
}
