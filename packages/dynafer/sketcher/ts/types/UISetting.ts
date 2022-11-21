import { IDOMFactory } from '../dom/DOMFactory';

export interface ISketcherSetting {
	tagName: string,
	attributes?: Record<string, string>,
	events?: [string, EventListener][],
	elements?: (string | IDOMFactory | ISketcherSetting)[],
}

export interface IModalSetting extends Pick<ISketcherSetting, 'events'> {
	title: string,
	icons: Record<string, string>,
	body?: IDOMFactory | IDOMFactory[],
	footer?: IDOMFactory | IDOMFactory[],
}

export interface IInputSetting extends Pick<ISketcherSetting, 'events'> {
	label?: string,
	placeholder?: string,
	value?: string,
}

export interface IPaletteSetting extends Pick<ISketcherSetting, 'events'> {
	width: number,
	height: number,
}

export interface IPaletteGuideSetting extends Pick<ISketcherSetting, 'events'> {
	palette: IDOMFactory<HTMLCanvasElement>,
	bOnlyVertical: boolean,
	guiding: () => void,
}

export interface IUISettingMap {
	Input: IInputSetting,
	Modal: IModalSetting,
	Palette: IPaletteSetting,
	PaletteGuide: IPaletteGuideSetting,
}
