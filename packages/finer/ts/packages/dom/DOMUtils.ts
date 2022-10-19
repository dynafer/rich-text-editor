import { Utils, Type } from 'dynafer/utils';
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

export interface IDOMUtils {
	NativeEvents: string[],
	CreateUEID: (id?: string, addNumber?: boolean) => string,
	GetModeTag: (mode: EModeEditor) => string,
	GetLineNumber: (selector: Element) => number,
}

const DOMUtils = (): IDOMUtils => {
	const CreateUEID = (id: string = '', addNumber: boolean = true): string => {
		id = Type.IsEmpty(id) ? Options.ProjectName : `${Options.ProjectName}-${id}`;
		return Utils.CreateUEID(id, addNumber);
	};

	const GetModeTag = (mode: EModeEditor): string => {
		switch (mode) {
			case EModeEditor.inline:
				return 'div';
			case EModeEditor.classic:
			default:
				return 'iframe';
		}
	};

	const GetLineNumber = (selector: Element): number => {
		const parent: ParentNode | null = selector.parentNode;
		if (!Type.IsElement(parent)) return 0;

		return Array.from(parent.children).indexOf(parent);
	};

	return {
		NativeEvents,
		CreateUEID,
		GetModeTag,
		GetLineNumber,
	};
};

export default DOMUtils();