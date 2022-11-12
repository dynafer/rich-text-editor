import Editor from '../Editor';

export enum ENativeEvents {
	abort = 'abort',
	animationcancel = 'animationcancel',
	animationend = 'animationend',
	animationiteration = 'animationiteration',
	animationstart = 'animationstart',
	beforeinput = 'beforeinput',
	cancel = 'cancel',
	canplay = 'canplay',
	canplaythrough = 'canplaythrough',
	change = 'change',
	close = 'close',
	compositionend = 'compositionend',
	compositionstart = 'compositionstart',
	compositionupdate = 'compositionupdate',
	cuechange = 'cuechange',
	durationchange = 'durationchange',
	emptied = 'emptied',
	ended = 'ended',
	error = 'error',
	formdata = 'formdata',
	gotpointercapture = 'gotpointercapture',
	input = 'input',
	invalid = 'invalid',
	load = 'load',
	loadeddata = 'loadeddata',
	loadedmetadata = 'loadedmetadata',
	loadstart = 'loadstart',
	lostpointercapture = 'lostpointercapture',
	mouseenter = 'mouseenter',
	mouseleave = 'mouseleave',
	mousemove = 'mousemove',
	mouseout = 'mouseout',
	mouseover = 'mouseover',
	pause = 'pause',
	play = 'play',
	playing = 'playing',
	pointercancel = 'pointercancel',
	pointerdown = 'pointerdown',
	pointerenter = 'pointerenter',
	pointerleave = 'pointerleave',
	pointermove = 'pointermove',
	pointerout = 'pointerout',
	pointerover = 'pointerover',
	pointerup = 'pointerup',
	progress = 'progress',
	ratechange = 'ratechange',
	reset = 'reset',
	resize = 'resize',
	scroll = 'scroll',
	securitypolicyviolation = 'securitypolicyviolation',
	seeked = 'seeked',
	seeking = 'seeking',
	select = 'select',
	selectionchange = 'selectionchange',
	selectstart = 'selectstart',
	slotchange = 'slotchange',
	stalled = 'stalled',
	submit = 'submit',
	suspend = 'suspend',
	timeupdate = 'timeupdate',
	toggle = 'toggle',
	transitioncancel = 'transitioncancel',
	transitionend = 'transitionend',
	transitionrun = 'transitionrun',
	transitionstart = 'transitionstart',
	volumechange = 'volumechange',
	waiting = 'waiting',
	webkitanimationend = 'webkitanimationend',
	webkitanimationiteration = 'webkitanimationiteration',
	webkitanimationstart = 'webkitanimationstart',
	webkittransitionend = 'webkittransitionend',

	keydown = 'keydown',
	keyup = 'keyup',
	keypress = 'keypress',

	mousedown = 'mousedown',
	mouseup = 'mouseup',
	click = 'click',
	auxclick = 'auxclick',
	dblclick = 'dblclick',
	drag = 'drag',
	dragend = 'dragend',
	dragenter = 'dragenter',
	dragleave = 'dragleave',
	dragover = 'dragover',
	dragstart = 'dragstart',
	drop = 'drop',
	contextmenu = 'contextmenu',
	wheel = 'wheel',

	touchcancel = 'touchcancel',
	touchend = 'touchend',
	touchmove = 'touchmove',
	touchstart = 'touchstart',

	focus = 'focus',
	focusin = 'focusin',
	focusout = 'focusout',
	blur = 'blur',
}

export interface IEventSetupCallback<K extends keyof GlobalEventHandlersEventMap> {
	(editor: Editor, event: GlobalEventHandlersEventMap[K]): void
}

export const Setup = <K extends keyof GlobalEventHandlersEventMap>(editor: Editor, eventName: K, event: IEventSetupCallback<K>) => {
	editor.On(eventName, (evt: GlobalEventHandlersEventMap[K]) => {
		event(editor, evt);
	});
};

export const CaretChangeEvent = <K extends keyof GlobalEventHandlersEventMap>(editor: Editor, event: GlobalEventHandlersEventMap[K]) => {
	const self = editor;
	const paths: Node[] = [];
	for (const path of event.composedPath()) {
		if (self.DOM.Utils.IsParagraph(path as Node) || self.GetBody() === path || self.DOM.GetRoot() === path) break;
		paths.push(path as Node);
	}
	editor.Dispatch('caret:change', paths);
};