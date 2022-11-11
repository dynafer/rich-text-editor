import { Str, Utils } from '@dynafer/utils';
import Options, { EModeEditor } from '../../Options';

const NativeEvents: string[] = [
	'abort animationcancel animationend animationiteration animationstart auxclick beforeinput blur cancel canplay canplaythrough change click close',
	'compositionend compositionstart compositionupdate contextmenu cuechange dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange',
	'emptied ended error focus focusin focusout formdata gotpointercapture input invalid keydown keypress keyup load loadeddata loadedmetadata',
	'loadstart lostpointercapture mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup pause play playing pointercancel pointerdown',
	'pointerenter pointerleave pointermove pointerout pointerover pointerup progress ratechange reset resize scroll securitypolicyviolation seeked seeking',
	'select selectionchange selectstart slotchange stalled submit suspend timeupdate toggle touchcancel touchend touchmove touchstart transitioncancel',
	'transitionend transitionrun transitionstart volumechange waiting webkitanimationend webkitanimationiteration webkitanimationstart webkittransitionend wheel'
].join(' ').split(' ');

const emptyHexCode = '&#xfeff;';

export interface IDOMUtils {
	NativeEvents: string[],
	CreateUEID: (id?: string, bAddNum?: boolean) => string,
	GetModeTag: (mode: EModeEditor) => string,
	GetEmptyString: () => string,
	IsParagraph: (selector: Node | null) => boolean,
	IsText: (selector: Node | null) => boolean,
	GetNodeName: (selector: Node | null) => string,
}

const DOMUtils = (): IDOMUtils => {
	const CreateUEID = (id: string = '', bAddNum: boolean = true): string =>
		Utils.CreateUEID(Str.IsEmpty(id) ? Options.ProjectName : `${Options.ProjectName}-${id}`, bAddNum);

	const GetModeTag = (mode: EModeEditor): string => {
		switch (mode) {
			case EModeEditor.inline:
				return 'div';
			case EModeEditor.classic:
			default:
				return 'iframe';
		}
	};

	const GetEmptyString = (): string => emptyHexCode;

	const IsParagraph = (selector: Node | null): boolean => selector?.nodeName?.toLowerCase() === 'p' ?? false;

	const IsText = (selector: Node | null): boolean => selector?.nodeName?.toLowerCase() === '#text' ?? false;

	const GetNodeName = (selector: Node | null): string => selector?.nodeName?.toLowerCase() ?? '';

	return {
		NativeEvents,
		CreateUEID,
		GetModeTag,
		GetEmptyString,
		IsParagraph,
		IsText,
		GetNodeName,
	};
};

export default DOMUtils();