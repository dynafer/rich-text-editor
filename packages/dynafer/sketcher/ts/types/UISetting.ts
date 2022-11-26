import { IDOMFactory } from '../dom/DOMFactory';

export interface ISketcherSetting {
	TagName: string,
	Attributes?: Record<string, string>,
	Events?: [string, EventListener][],
	Elements?: (string | IDOMFactory | ISketcherSetting)[],
}

export interface IModalSetting extends Pick<ISketcherSetting, 'Events'> {
	Title: string,
	Icons: Record<string, string>,
	Body?: IDOMFactory | IDOMFactory[],
	Footer?: IDOMFactory | IDOMFactory[],
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
	Palette: IDOMFactory<HTMLCanvasElement>,
	bOnlyVertical: boolean,
	Guiding: () => void,
}

export interface IUISettingMap {
	Input: IInputSetting,
	Modal: IModalSetting,
	Palette: IPaletteSetting,
	PaletteGuide: IPaletteGuideSetting,
}
