(function () {
	'use strict';

	RichEditor.Icons.Register({
		AlignCenter: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>',
		AlignJustify: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>',
		AlignLeft: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>',
		AlignRight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>',
		AngleDown: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="37.6276 112.928 326.3 175.7"><path d="M 41.3146 116.6146 a 12.55 12.55 90 0 1 17.7708 0 L 200.8 258.3543 l 141.7146 -141.7397 a 12.55 12.55 90 0 1 17.7708 17.7708 l -150.6 150.6 a 12.55 12.55 90 0 1 -17.7708 0 l -150.6 -150.6 a 12.55 12.55 90 0 1 0 -17.7708 z"/></svg>',
		Bold: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2.5 3 10 10"><path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/></svg>',
		Check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 3 10 10"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>',
		Close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="3.5 3.5 9 9"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>',
		Code: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 1 14 14"><path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"/></svg>',
		ColorA: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 3 8 9.496"><path d="m 4.266 12.496 l 0.96 -2.853 H 8.76 l 0.96 2.853 H 11 L 7.62 3 H 6.38 L 3 12.496 h 1.266 Z m 2.748 -8.063 l 1.419 4.23 h -2.88 l 1.426 -4.23 h 0.035"/></svg>',
		Fill: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 0.5 14 14"><path d="M6.192 2.78c-.458-.677-.927-1.248-1.35-1.643a2.972 2.972 0 0 0-.71-.515c-.217-.104-.56-.205-.882-.02-.367.213-.427.63-.43.896-.003.304.064.664.173 1.044.196.687.556 1.528 1.035 2.402L.752 8.22c-.277.277-.269.656-.218.918.055.283.187.593.36.903.348.627.92 1.361 1.626 2.068.707.707 1.441 1.278 2.068 1.626.31.173.62.305.903.36.262.05.64.059.918-.218l5.615-5.615c.118.257.092.512.05.939-.03.292-.068.665-.073 1.176v.123h.003a1 1 0 0 0 1.993 0H14v-.057a1.01 1.01 0 0 0-.004-.117c-.055-1.25-.7-2.738-1.86-3.494a4.322 4.322 0 0 0-.211-.434c-.349-.626-.92-1.36-1.627-2.067-.707-.707-1.441-1.279-2.068-1.627-.31-.172-.62-.304-.903-.36-.262-.05-.64-.058-.918.219l-.217.216zM4.16 1.867c.381.356.844.922 1.311 1.632l-.704.705c-.382-.727-.66-1.402-.813-1.938a3.283 3.283 0 0 1-.131-.673c.091.061.204.15.337.274zm.394 3.965c.54.852 1.107 1.567 1.607 2.033a.5.5 0 1 0 .682-.732c-.453-.422-1.017-1.136-1.564-2.027l1.088-1.088c.054.12.115.243.183.365.349.627.92 1.361 1.627 2.068.706.707 1.44 1.278 2.068 1.626.122.068.244.13.365.183l-4.861 4.862a.571.571 0 0 1-.068-.01c-.137-.027-.342-.104-.608-.252-.524-.292-1.186-.8-1.846-1.46-.66-.66-1.168-1.32-1.46-1.846-.147-.265-.225-.47-.251-.607a.573.573 0 0 1-.01-.068l3.048-3.047zm2.87-1.935a2.44 2.44 0 0 1-.241-.561c.135.033.324.11.562.241.524.292 1.186.8 1.846 1.46.45.45.83.901 1.118 1.31a3.497 3.497 0 0 0-1.066.091 11.27 11.27 0 0 1-.76-.694c-.66-.66-1.167-1.322-1.458-1.847z"/></svg>',
		HorizontalLine: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 7 12 1"><path d="M 2 7.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 z"/></svg>',
		Hyperlink: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 0.5 14 14"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/></svg>',
		Image: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"/></svg>',
		Indent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm.646 2.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L4.293 8 2.646 6.354a.5.5 0 0 1 0-.708zM7 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>',
		Info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 3 10 10"><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>',
		Italic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 3 10 10"><path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/></svg>',
		Media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/></svg>',
		MediaAlignCenter: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M 2 12.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 6 5 a 1.5 1.5 0 0 0 -1.5 1.5 v 3 a 1.5 1.5 0 0 0 1.5 1.5 h 4 a 1.5 1.5 0 0 0 1.5 -1.5 v -3 a 1.5 1.5 0 0 0 -1.5 -1.5 h 0 Z M 2 3.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z"/></svg>',
		MediaAlignLeft: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M 2 12.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 3.5 5 a 1.5 1.5 0 0 0 -1.5 1.5 v 3 a 1.5 1.5 0 0 0 1.5 1.5 h 4 a 1.5 1.5 0 0 0 1.5 -1.5 v -3 a 1.5 1.5 0 0 0 -1.5 -1.5 h 0 Z M 2 3.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z"/></svg>',
		MediaAlignRight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M 2 12.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 8.5 5 a 1.5 1.5 0 0 0 -1.5 1.5 v 3 a 1.5 1.5 0 0 0 1.5 1.5 h 4 a 1.5 1.5 0 0 0 1.5 -1.5 v -3 a 1.5 1.5 0 0 0 -1.5 -1.5 h 0 Z M 2 3.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z"/></svg>',
		MediaFloatLeft: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M 2 12.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 3.5 5 a 1.5 1.5 0 0 0 -1.5 1.5 v 3 a 1.5 1.5 0 0 0 1.5 1.5 h 4 a 1.5 1.5 0 0 0 1.5 -1.5 v -3 a 1.5 1.5 0 0 0 -1.5 -1.5 h 0 Z M 2 3.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 10 5.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 3 a 0.5 0.5 0 0 1 0 1 h -3 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 10 8 a 0.5 0.5 0 0 1 0.5 -0.5 h 3 a 0.5 0.5 0 0 1 0 1 h -3 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 10 10.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 3 a 0.5 0.5 0 0 1 0 1 h -3 a 0.5 0.5 0 0 1 -0.5 -0.5 Z"/></svg>',
		MediaFloatRight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path fill-rule="evenodd" d="M 2 12.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 8.5 5 a 1.5 1.5 0 0 0 -1.5 1.5 v 3 a 1.5 1.5 0 0 0 1.5 1.5 h 4 a 1.5 1.5 0 0 0 1.5 -1.5 v -3 a 1.5 1.5 0 0 0 -1.5 -1.5 h 0 Z M 2 3.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 11 a 0.5 0.5 0 0 1 0 1 h -11 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 2 5.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 3 a 0.5 0.5 0 0 1 0 1 h -3 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 2 8 a 0.5 0.5 0 0 1 0.5 -0.5 h 3 a 0.5 0.5 0 0 1 0 1 h -3 a 0.5 0.5 0 0 1 -0.5 -0.5 Z M 2 10.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 3 a 0.5 0.5 0 0 1 0 1 h -3 a 0.5 0.5 0 0 1 -0.5 -0.5 Z"/></svg>',
		Move: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10zM.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8z"/></svg>',
		OrderedList: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 2 14 14"><path d="M 5 13.8 a 0.6 0.6 90 0 1 0.6 -0.6 h 8.8 a 0.6 0.6 90 0 1 0 1.2 h -8.8 a 0.6 0.6 90 0 1 -0.6 -0.6 z m 0 -4.8 a 0.6 0.6 90 0 1 0.6 -0.6 h 8.8 a 0.6 0.6 90 0 1 0 1.2 h -8.8 a 0.6 0.6 90 0 1 -0.6 -0.6 z m 0 -4.8 a 0.6 0.6 90 0 1 0.6 -0.6 h 8.8 a 0.6 0.6 90 0 1 0 1.2 h -8.8 a 0.6 0.6 90 0 1 -0.6 -0.6 z M 2.0556 14.238 v -0.5688 H 2.4 c 0.2604 0 0.4356 -0.1644 0.4356 -0.3804 c 0 -0.222 -0.1896 -0.372 -0.4332 -0.372 c -0.2676 0 -0.4404 0.1824 -0.4476 0.372 h -0.708 c 0.0192 -0.5604 0.4476 -0.9444 1.1832 -0.9444 c 0.7056 -0.0024 1.1448 0.3492 1.1484 0.8436 a 0.714 0.714 90 0 1 -0.5904 0.7128 v 0.0396 a 0.738 0.738 90 0 1 0.6828 0.7572 c 0.0036 0.6396 -0.6024 0.96 -1.2612 0.96 c -0.7872 0 -1.2 -0.444 -1.2096 -0.9528 h 0.6984 c 0.0096 0.2136 0.2232 0.3672 0.5064 0.3708 c 0.3048 0 0.5088 -0.174 0.5064 -0.42 c -0.0024 -0.234 -0.186 -0.4176 -0.4968 -0.4176 h -0.36 z m -0.0048 -5.6388 h -0.7248 v -0.042 c 0 -0.4896 0.354 -1.0128 1.1496 -1.0128 c 0.6996 0 1.152 0.3912 1.152 0.9072 c 0 0.4668 -0.3084 0.7404 -0.5712 1.0176 l -0.6444 0.6864 v 0.036 h 1.2648 V 10.8 H 1.3716 v -0.474 l 1.1484 -1.188 c 0.1656 -0.1704 0.3516 -0.3648 0.3516 -0.6096 c 0 -0.216 -0.1764 -0.384 -0.4104 -0.384 a 0.396 0.396 90 0 0 -0.4104 0.4056 v 0.0492 z M 3.0768 6 h -0.762 V 3.5088 h -0.0372 l -0.7176 0.504 v -0.6804 l 0.7548 -0.5316 h 0.762 V 6 z"/></svg>',
		Outdent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 12 12"><path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm10.646 2.146a.5.5 0 0 1 .708.708L11.707 8l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zM2 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>',
		Palette: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07zM8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>',
		Redo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 0.5 13.5 13.5"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>',
		Resize: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M 576 80 a 48 48 0 1 0 -96 0 a 48 48 0 1 0 96 0 z M 448 208 a 48 48 0 1 0 -96 0 a 48 48 0 1 0 96 0 z M 400 384 a 48 48 0 1 0 0 -96 a 48 48 0 1 0 0 96 z m 48 80 a 48 48 0 1 0 -96 0 a 48 48 0 1 0 96 0 z m 128 0 a 48 48 0 1 0 -96 0 a 48 48 0 1 0 96 0 z M 272 384 a 48 48 0 1 0 0 -96 a 48 48 0 1 0 0 96 z m 48 80 a 48 48 0 1 0 -96 0 a 48 48 0 1 0 96 0 z M 144 512 a 48 48 0 1 0 0 -96 a 48 48 0 1 0 0 96 z M 576 336 a 48 48 0 1 0 -96 0 a 48 48 0 1 0 96 0 z m -48 -80 a 48 48 0 1 0 0 -96 a 48 48 0 1 0 0 96 z"/></svg>',
		SelectAll: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/><path d="M 3 5.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 9 a 0.5 0.5 0 0 1 0 1 h -9 a 0.5 0.5 0 0 1 -0.5 -0.5 z M 3 10.5 a 0.5 0.5 0 0 1 0.5 -0.5 h 9 a 0.5 0.5 0 0 1 0 1 h -9 A 0.5 0.5 0 0 1 3 10.5 z M 3 8 a 0.5 0.5 0 0 1 0.5 -0.5 h 4.5 a 0.5 0.5 0 0 1 0 1 h -4.5 a 0.5 0.5 0 0 1 -0.5 -0.5 z M 9.5 8 a 0.5 0.5 0 0 1 0.5 -0.5 h 2.5 a 0.5 0.5 0 0 1 0 1 h -2.5 a 0.5 0.5 0 0 1 -0.5 -0.5 z"/></svg>',
		Strikethrough: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 3 10 10"><path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967z"/></svg>',
		Subscript: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2.5 12.5 12.5"><path d="m3.266 12.496.96-2.853H7.76l.96 2.853H10L6.62 3H5.38L2 12.496h1.266Zm2.748-8.063 1.419 4.23h-2.88l1.426-4.23h.035Zm6.132 7.203v-.075c0-.332.234-.618.619-.618.354 0 .618.256.618.58 0 .362-.271.649-.52.898l-1.788 1.832V15h3.59v-.958h-1.923v-.045l.973-1.04c.415-.438.867-.845.867-1.547 0-.8-.701-1.41-1.787-1.41-1.23 0-1.795.8-1.795 1.576v.06h1.146Z"/></svg>',
		Superscript: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2.5 0.5 12.5 12.5"><path d="m4.266 12.496.96-2.853H8.76l.96 2.853H11L7.62 3H6.38L3 12.496h1.266Zm2.748-8.063 1.419 4.23h-2.88l1.426-4.23h.035Zm5.132-1.797v-.075c0-.332.234-.618.619-.618.354 0 .618.256.618.58 0 .362-.271.649-.52.898l-1.788 1.832V6h3.59v-.958h-1.923v-.045l.973-1.04c.415-.438.867-.845.867-1.547 0-.8-.701-1.41-1.787-1.41C11.565 1 11 1.8 11 2.576v.06h1.146Z"/></svg>',
		Table: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"/></svg>',
		TableColumn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M 64 32 c -35.3 0 -64 28.7 -64 64 v 320 c 0 35.3 28.7 64 64 64 h 384 c 35.3 0 64 -28.7 64 -64 v -320 c 0 -35.3 -28.7 -64 -64 -64 h -384 Z M 158 70 v 96 h -120 v -96 h 120 Z M 185.5 60 h 141 v 121 h -141 v -121 Z M 474 70 v 96 h -120 v -96 h 120 Z M 175.5 50 h 161 v 412 h -161 v -412 Z M 38 208 h 120 v 96 h -120 v -96 Z M 326.5 195 v 121 h -141 v -121 h 141 Z M 354 208 h 120 v 96 h -120 v -96 Z M 158 346 v 96 h -120 v -96 h 120 Z M 185.5 331 h 141 v 121 h -141 v -121 Z M 474 346 v 96 h -120 v -96 h 120 Z"/></svg>',
		TableRow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M 64 32 c -35.3 0 -64 28.7 -64 64 v 320 c 0 35.3 28.7 64 64 64 h 384 c 35.3 0 64 -28.7 64 -64 v -320 c 0 -35.3 -28.7 -64 -64 -64 h -384 Z M 158 70 v 96 h -120 v -96 h 120 Z M 196 70 h 120 v 96 h -120 v -96 Z M 474 70 v 96 h -120 v -96 h 120 Z M 20 178 h 472 v 156 h -472 v -156 Z M 30 188 h 141 v 136 h -141 v -136 Z M 326.5 188 v 136 h -141 v -136 h 141 Z M 341 188 h 141 v 136 h -141 v -136 Z M 158 346 v 96 h -120 v -96 h 120 Z M 196 346 h 120 v 96 h -120 v -96 Z M 474 346 v 96 h -120 v -96 h 120 Z"/></svg>',
		Trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/></svg>',
		Underline: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 3 12 12"><path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136zM12.5 15h-9v-1h9v1z"/></svg>',
		Undo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 0.5 13.5 13.5"><path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/></svg>',
		UnorderedList: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 4.5 13.5 7.5"><path fill-rule="evenodd" d="M 4.5 12.65 a 0.55 0.55 90 0 1 0.55 -0.55 h 8.8 a 0.55 0.55 90 0 1 0 1.1 h -8.8 a 0.55 0.55 90 0 1 -0.55 -0.55 z m 0 -4.4 a 0.55 0.55 90 0 1 0.55 -0.55 h 8.8 a 0.55 0.55 90 0 1 0 1.1 h -8.8 a 0.55 0.55 90 0 1 -0.55 -0.55 z m 0 -4.4 a 0.55 0.55 90 0 1 0.55 -0.55 h 8.8 a 0.55 0.55 90 0 1 0 1.1 h -8.8 a 0.55 0.55 90 0 1 -0.55 -0.55 z M 2.2 4.95 a 1.1 1.1 90 1 0 0 -2.2 a 1.1 1.1 90 0 0 0 2.2 z m 0 4.4 a 1.1 1.1 90 1 0 0 -2.2 a 1.1 1.1 90 0 0 0 2.2 z m 0 4.4 a 1.1 1.1 90 1 0 0 -2.2 a 1.1 1.1 90 0 0 0 2.2 z"/></svg>',
	});

})();
