import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import { ADJUSTABLE_LINE_HALF_SIZE, CreateAdjustableEdgeSize, CreateMovableHorizontalSize } from '../dom/tools/table/TableToolsUtils';

export enum ENativeEvents {
	abort = 'abort',
	animationcancel = 'animationcancel',
	animationend = 'animationend',
	animationiteration = 'animationiteration',
	animationstart = 'animationstart',
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

	beforeinput = 'beforeinput',
	input = 'input',
}

export enum EInputEventType {
	insertText = 'insertText',
	insertReplacementText = 'insertReplacementText',
	insertLineBreak = 'insertLineBreak',
	insertParagraph = 'insertParagraph',
	insertOrderedList = 'insertOrderedList',
	insertUnorderedList = 'insertUnorderedList',
	insertHorizontalRule = 'insertHorizontalRule',
	insertFromYank = 'insertFromYank',
	insertFromDrop = 'insertFromDrop',
	insertFromPaste = 'insertFromPaste',
	insertTranspose = 'insertTranspose',
	insertCompositionText = 'insertCompositionText',
	insertFromComposition = 'insertFromComposition',
	insertLink = 'insertLink',
	deleteByComposition = 'deleteByComposition',
	deleteCompositionText = 'deleteCompositionText',
	deleteWordBackward = 'deleteWordBackward',
	deleteWordForward = 'deleteWordForward',
	deleteSoftLineBackward = 'deleteSoftLineBackward',
	deleteSoftLineForward = 'deleteSoftLineForward',
	deleteEntireSoftLine = 'deleteEntireSoftLine',
	deleteHardLineBackward = 'deleteHardLineBackward',
	deleteHardLineForward = 'deleteHardLineForward',
	deleteByDrag = 'deleteByDrag',
	deleteByCut = 'deleteByCut',
	deleteByContent = 'deleteByContent',
	deleteContentBackward = 'deleteContentBackward',
	deleteContentForward = 'deleteContentForward',
	historyUndo = 'historyUndo',
	historyRedo = 'historyRedo',
	formatBold = 'formatBold',
	formatItalic = 'formatItalic',
	formatUnderline = 'formatUnderline',
	formatStrikethrough = 'formatStrikethrough',
	formatSuperscript = 'formatSuperscript',
	formatSubscript = 'formatSubscript',
	formatJustifyFull = 'formatJustifyFull',
	formatJustifyCenter = 'formatJustifyCenter',
	formatJustifyRight = 'formatJustifyRight',
	formatJustifyLeft = 'formatJustifyLeft',
	formatIndent = 'formatIndent',
	formatOutdent = 'formatOutdent',
	formatRemove = 'formatRemove',
	formatSetBlockTextDirection = 'formatSetBlockTextDirection',
	formatSetInlineTextDirection = 'formatSetInlineTextDirection',
	formatBackColor = 'formatBackColor',
	formatFontColor = 'formatFontColor',
	formatFontName = 'formatFontName',
}

export interface IEventSetupCallback<K extends keyof GlobalEventHandlersEventMap> {
	(editor: Editor, event: GlobalEventHandlersEventMap[K]): void;
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
		if (self.GetBody() === path || self.DOM.GetRoot() === path) break;
		Arr.Unshift(paths, path as Node);
	}
	self.Dispatch('caret:change', paths);
};

export const PreventEvent = (event: Event) => {
	event.preventDefault();
	event.stopImmediatePropagation();
	event.stopPropagation();
};

export const ChangeMovablePosition = (editor: Editor) => {
	const self = editor;
	const DOM = self.DOM;
	for (const movable of DOM.SelectAll({ attrs: ['data-movable'] })) {
		const figure = movable.parentElement?.parentElement ?? null;
		const figureType = DOM.GetAttr(figure, 'type');
		if (!figure || !figureType) continue;

		const figureElement = DOM.Select(figureType, figure) as HTMLElement;
		if (!figureElement) continue;

		DOM.SetStyle(movable, 'left', CreateMovableHorizontalSize(figureElement.offsetLeft, true));
	}

	for (const edge of DOM.SelectAll({ attrs: ['data-adjustable-edge'] })) {
		const figure = edge.parentElement?.parentElement?.parentElement ?? null;
		const figureType = DOM.GetAttr(figure, 'type');
		if (!figure || !figureType) continue;

		const figureElement = DOM.Select(figureType, figure) as HTMLElement;
		if (!figureElement) continue;

		const bLeft = DOM.HasAttr(edge, 'data-horizontal', 'left');
		const bTop = DOM.HasAttr(edge, 'data-vertical', 'top');

		DOM.SetStyles(edge, {
			left: CreateAdjustableEdgeSize(figureElement.offsetLeft + (bLeft ? 0 : figureElement.offsetWidth), true),
			top: CreateAdjustableEdgeSize(figureElement.offsetTop + (bTop ? 0 : figureElement.offsetHeight), true),
		});
	}

	for (const line of DOM.SelectAll({ attrs: ['data-adjustable-line'] })) {
		const figure = line.parentElement?.parentElement?.parentElement ?? null;
		const figureType = DOM.GetAttr(figure, 'type');
		if (!figure || !figureType) continue;

		const figureElement = DOM.Select(figureType, figure) as HTMLElement;
		if (!figureElement) continue;

		const bWidth = DOM.HasAttr(line, 'data-adjustable-line', 'width');

		DOM.SetStyles(line, {
			width: `${bWidth ? ADJUSTABLE_LINE_HALF_SIZE * 2 - 1 : figureElement.offsetWidth}px`,
			height: `${bWidth ? figureElement.offsetHeight : ADJUSTABLE_LINE_HALF_SIZE * 2 - 1}px`,
			left: `${bWidth ? 0 : figureElement.offsetLeft}px`,
			top: `${bWidth ? figureElement.offsetTop : 0}px`,
		});
	}
};