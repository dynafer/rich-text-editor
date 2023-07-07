(function () {
    'use strict';

    const getType = (value = undefined) => {
        const type = typeof value;
        switch (true) {
            case value === null:
                return 'null';
            case type === 'object' && Array.isArray(value):
                return 'array';
            default:
                return type;
        }
    };
    const isType = (type) => (value) => getType(value) === type;
    const IsArray = isType('array');
    const IsNumber = isType('number');
    const IsObject = isType('object');
    const IsString = isType('string');
    const IsBoolean = isType('boolean');
    const IsFunction = isType('function');
    const IsNull = isType('null');
    const IsUndefined = isType('undefined');

    const IsEmpty$1 = (value) => IsArray(value) && value.length === 0;
    const Each = (array, callback) => {
        const length = array.length;
        for (let index = 0; index < length; ++index) {
            const value = array[index];
            callback(value, () => { index = length; });
        }
    };
    const Contains$1 = (array, expect) => IsArray(array) && array.includes(expect);
    const Push = (array, ...items) => array.push(...items);
    const Unshift = (array, ...items) => array.unshift(...items);
    const Shift = (array) => array.shift();
    const WhileShift = (array, callback) => {
        let currentItem;
        let bBreak = false;
        const exit = () => { bBreak = true; };
        while (!IsEmpty$1(array)) {
            currentItem = Shift(array);
            if (!currentItem)
                continue;
            callback(currentItem, exit);
            if (bBreak)
                break;
        }
    };
    const Reverse = (array) => {
        const reversed = [];
        Each(array, value => Unshift(reversed, value));
        return reversed;
    };
    const Clean = (array) => array.splice(0, array.length);
    const Convert = (array) => Array.from(array);

    const Keys = (obj, callback) => {
        if (!IsObject(obj))
            return [];
        const keys = Object.keys(obj);
        if (!IsFunction(callback))
            return keys;
        const length = keys.length;
        for (let index = 0; index < length; ++index) {
            const key = keys[index];
            callback(key, () => { index = length; });
        }
        return keys;
    };
    const Values = (obj, callback) => {
        if (!IsObject(obj))
            return [];
        const values = Object.values(obj);
        if (!IsFunction(callback))
            return values;
        const length = values.length;
        for (let index = 0; index < length; ++index) {
            const value = values[index];
            callback(value, () => { index = length; });
        }
        return values;
    };
    const HasProperty = (obj, key) => {
        var _a;
        const assigned = (_a = Object.assign(obj !== null && obj !== void 0 ? obj : {})) === null || _a === void 0 ? void 0 : _a[key];
        if (IsUndefined(assigned) || IsNull(assigned))
            return false;
        return true;
    };

    const IsEmpty = (value) => IsString(value) && value.length === 0;
    const LowerCase = (value) => value.toString().toLowerCase();
    const UpperCase = (value) => value.toString().toUpperCase();
    const Contains = (value, expect) => IsString(expect) ? value.includes(expect) : expect.test(value);
    const Join = (attacher, ...args) => args.join(attacher);
    const Merge = (...args) => Join('', ...args);

    let projectURL = document.baseURI;
    const dumpURL = projectURL.split('/');
    projectURL = dumpURL.slice(0, dumpURL.length - 1).join('/');
    Clean(dumpURL);
    Each(document.head.querySelectorAll('script'), (loadedScript, exit) => {
        if (!Contains(loadedScript.src, 'editor.'))
            return;
        const tempSrc = loadedScript.src.split('/');
        projectURL = tempSrc.slice(0, tempSrc.length - 1).join('/');
        if (IsEmpty(projectURL))
            projectURL = '.';
        Clean(tempSrc);
        exit();
    });
    var EEditorMode;
    (function (EEditorMode) {
        EEditorMode["classic"] = "classic";
        EEditorMode["inline"] = "inline";
    })(EEditorMode || (EEditorMode = {}));
    const Options = () => {
        const PROJECT_NAME = 'rich-text-editor';
        const SHORT_NAME = 'editor';
        const ATTRIBUTES = {};
        const addAttributeNames = (...names) => WhileShift(names, name => {
            ATTRIBUTES[UpperCase(name).replace(/-/g, '_')] = Merge(SHORT_NAME, '-', name);
        });
        addAttributeNames('adjustable-edge', 'adjustable-edge-group', 'adjustable-line', 'adjustable-line-group', 'adjusting', 'as-text', 'fake', 'fixed', 'focused', 'icon', 'horizontal', 'movable', 'original-height', 'original-width', 'parts-menu', 'remove', 'selected', 'style', 'type', 'vertical');
        const URL_PREFIX = new URL(projectURL).href;
        const URLS = {
            PREFIX: URL_PREFIX,
            CSS: `${URL_PREFIX}`,
            PLUGIN: `${URL_PREFIX}/plugins`,
            ICON: `${URL_PREFIX}/icons`,
            LANGUAGE: `${URL_PREFIX}/langs`,
        };
        const JoinURL = (type, name) => {
            switch (type) {
                case 'css':
                    if (!Contains(name, '.css'))
                        name = `${name}.min.css`;
                    return `${URLS.CSS}/${name}`;
                case 'plugin':
                    if (!Contains(name, '.js'))
                        name = `${name}/${name}.min.js`;
                    return `${URLS.PLUGIN}/${name}`;
                case 'icon':
                    if (!Contains(name, '.js'))
                        name = `${name}/icons.min.js`;
                    return `${URLS.ICON}/${name}`;
                case 'language':
                    if (!Contains(name, '.js'))
                        name = `${name}.js`;
                    return `${URLS.LANGUAGE}/${name}`;
                default:
                    return `${URLS.PREFIX}/${name}`;
            }
        };
        const GetModeTag = (mode) => {
            switch (mode) {
                case EEditorMode.inline:
                    return 'div';
                case EEditorMode.classic:
                default:
                    return 'iframe';
            }
        };
        return {
            PROJECT_NAME,
            SHORT_NAME,
            ATTRIBUTES,
            URLS,
            JoinURL,
            GetModeTag,
        };
    };
    var Options$1 = Options();

    const createCommandName = (name) => Join(':', 'Media', name);
    const createImageCommandName = (name) => Join(':', 'Image', name);
    const createStyleCommandName = (name) => Join(':', 'MediaStyle', name);
    const COMMAND_NAMES_MAP = {
        MEDIA_CREATE: createCommandName('Create'),
        MEDIA_UPDATE: createCommandName('Update'),
        MEDIA_REMOVE: createCommandName('Remove'),
        IMAGE_CREATE: createImageCommandName('Create'),
        IMAGE_UPLOAD: createImageCommandName('Upload'),
        IMAGE_UPDATE: createImageCommandName('Update'),
        IMAGE_REMOVE: createImageCommandName('Remove'),
        FLOAT_LEFT: createStyleCommandName('FloatLeft'),
        FLOAT_RIGHT: createStyleCommandName('FloatRight'),
        ALIGN_LEFT: createStyleCommandName('AlignLeft'),
        ALIGN_CENTER: createStyleCommandName('AlignCenter'),
        ALIGN_RIGHT: createStyleCommandName('AlignRight'),
    };
    const FILE_SIZE_UNITS = ['byte', 'KB', 'MB', 'GB', 'TB'];
    const MAX_BYTES = 1024;
    const CalculateFileSize = (type = 'auto', size = 0) => {
        const fileSize = {
            Size: size,
            Unit: FILE_SIZE_UNITS[0]
        };
        switch (LowerCase(type)) {
            case 'kb':
            case 'mb':
            case 'gb':
            case 'tb':
                const power = Math.min(Math.floor(Math.log(size) / Math.log(MAX_BYTES)), FILE_SIZE_UNITS.length - 1);
                fileSize.Size = size / (Math.pow(MAX_BYTES, power));
                fileSize.Unit = FILE_SIZE_UNITS[power];
                break;
            case 'auto':
                for (let index = 0, length = FILE_SIZE_UNITS.length; index < length; ++index) {
                    const currentSize = size / (Math.pow(MAX_BYTES, index));
                    if (Math.floor(currentSize * 10) < 1)
                        break;
                    fileSize.Size = currentSize;
                    fileSize.Unit = FILE_SIZE_UNITS[index];
                }
                break;
        }
        return fileSize;
    };
    const GetAllowedExtensions = (mimeTypes, accept) => {
        if (!accept || accept === 'all')
            return 'image/*';
        const extensions = IsArray(accept) ? accept : [];
        const availableExtensions = [];
        if (IsString(accept)) {
            let copiedAccept = accept;
            if (Contains(accept, ','))
                copiedAccept = copiedAccept.replace(/\s+/g, '');
            copiedAccept = copiedAccept.replace(/\s+/g, ',');
            Push(extensions, ...copiedAccept.split(','));
        }
        Each(extensions, extension => {
            if (!IsString(extension))
                return;
            const escapedString = LowerCase(extension.replace('image/', '').trim());
            Each(mimeTypes, (mimeType, exit) => {
                if (Contains$1(availableExtensions, mimeType) || (!Contains(mimeType, escapedString) && !Contains(escapedString, mimeType)))
                    return;
                Push(availableExtensions, mimeType);
                exit();
            });
        });
        if (mimeTypes.length === availableExtensions.length || IsEmpty$1(availableExtensions))
            return 'image/*';
        for (let index = 0, length = availableExtensions.length; index < length; ++index) {
            availableExtensions[index] = Merge('image/', availableExtensions[index]);
        }
        return Join(',', ...availableExtensions);
    };
    const GetMenuText = (editor, name, defaultText) => editor.Lang(Merge('plugins.parts.menu.', name), defaultText);

    const BlobItem = (file) => {
        const Get = () => file;
        const GetName = () => file.name;
        const GetType = () => file.type;
        const GetSize = (type = 'auto') => CalculateFileSize(type, file.size);
        const Read = (type, loadCallback) => {
            const reader = new FileReader();
            const load = () => {
                loadCallback(reader.result);
                reader.removeEventListener(RichEditor.NativeEventMap.load, load);
            };
            reader.addEventListener('load', load);
            switch (type) {
                case 'ArrayBuffer':
                    reader.readAsArrayBuffer(file);
                    break;
                case 'BinaryString':
                    reader.readAsBinaryString(file);
                    break;
                case 'DataURL':
                    reader.readAsDataURL(file);
                    break;
                case 'Text':
                    reader.readAsText(file);
                    break;
            }
        };
        return {
            Get,
            GetName,
            GetType,
            GetSize,
            Read,
        };
    };

    const BlobList = (...list) => {
        const files = [];
        Each(list, file => Push(files, BlobItem(file)));
        const Get = () => list;
        const GetList = () => files;
        const GetLength = () => files.length;
        const GetTotalSize = (type = 'auto') => {
            let bytes = 0;
            Each(files, file => {
                bytes += file.GetSize('byte').Size;
            });
            return CalculateFileSize(type, bytes);
        };
        return {
            Get,
            GetList,
            GetLength,
            GetTotalSize,
        };
    };

    const URLMatcher = () => {
        const matchers = [
            {
                pattern: /(www\.)?(youtube\.com|youtu\.be)\/.+/i,
                format: 'iframe',
                width: 560,
                height: 315,
                convert: (url) => {
                    const chunks = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                    if (!chunks[2])
                        return chunks[0];
                    chunks[2] = chunks[2].split(/[^0-9a-z_\-]/i)[0];
                    return Merge('https://www.youtube.com/embed/', chunks[2]);
                }
            },
            {
                pattern: /(www\.)?(google\.com|maps\.google)\/(maps\/)?.+/i,
                format: 'iframe',
                width: 600,
                height: 450,
            },
            {
                pattern: /(www\.)?(vimeo\.com|player\.vimeo)\/.+/i,
                format: 'iframe',
                width: 640,
                height: 360,
                convert: (url) => {
                    const chunks = url.replace(/(>|<)/gi, '').split(/(vimeo\.com\/)(video\/)?/);
                    if (!chunks[3])
                        return chunks[0];
                    chunks[3] = chunks[3].split(/[^0-9]/i)[0];
                    return Merge('https://player.vimeo.com/video/', chunks[3]);
                }
            },
            {
                pattern: /(www\.)?(dailymotion\.com|dai\.ly)\/.+/i,
                format: 'iframe',
                width: 640,
                height: 360,
                convert: (url) => {
                    const chunks = url.replace(/(>|<)/gi, '').split(/(dailymotion\.com\/|dai\.ly\/)(embed\/)?(video\/)?/);
                    if (!chunks[4])
                        return chunks[0];
                    chunks[4] = chunks[4].split(/[^0-9a-z]/i)[0];
                    return Merge('https://www.dailymotion.com/embed/video/', chunks[4]);
                }
            }
        ];
        const Match = (url) => {
            const matched = {
                URL: url,
                Format: null,
                Width: null,
                Height: null,
            };
            Each(matchers, (matcher, exit) => {
                if (!matcher.pattern.test(url))
                    return;
                if (IsFunction(matcher.convert))
                    matched.URL = matcher.convert(matched.URL);
                matched.Format = matcher.format;
                matched.Width = matcher.width;
                matched.Height = matcher.height;
                exit();
            });
            return matched;
        };
        const Add = (opts) => {
            if (!HasProperty(opts.pattern, 'test')
                || !IsString(opts.format)
                || !IsNumber(opts.width)
                || !IsNumber(opts.height))
                return;
            const matcher = {
                pattern: opts.pattern,
                format: opts.format,
                width: opts.width,
                height: opts.height,
            };
            if (IsFunction(opts.convert))
                matcher.convert = opts.convert;
            Push(matchers, matcher);
        };
        return {
            Match,
            Add,
        };
    };
    var URLMatcher$1 = URLMatcher();

    const Media = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const PartsTool = self.Tools.Parts;
        const CaretUtils = self.Utils.Caret;
        const formatter = self.Formatter;
        const completeCreation = (...figures) => {
            var _a;
            self.Focus();
            PartsTool.UnsetAllFocused();
            const caret = CaretUtils.Get();
            const lines = self.GetLines();
            const finish = () => {
                const newRange = self.Utils.Range();
                newRange.SetStartToEnd(figures[0], 1, 1);
                CaretUtils.UpdateRange(newRange);
                self.Utils.Shared.DispatchCaretChange([figures[0]]);
                Clean(figures);
            };
            if (!caret) {
                const insert = IsEmpty$1(lines) ? DOM.Insert : DOM.InsertAfter;
                const target = IsEmpty$1(lines) ? self.GetBody() : lines[0];
                const insertions = IsEmpty$1(lines) ? figures : Reverse(figures);
                insert(target, ...insertions);
                return finish();
            }
            self.Utils.Shared.DeleteRange(caret);
            const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);
            const node = formatter.Utils.GetParentIfText(caret.Start.Node);
            const blockNode = (_a = StartBlock !== null && StartBlock !== void 0 ? StartBlock : DOM.Closest(node, { tagName: Convert(formatter.Formats.BlockFormatTags.Block) })) !== null && _a !== void 0 ? _a : lines[0];
            const insert = !blockNode ? DOM.Insert : DOM.InsertAfter;
            const insertions = !blockNode ? [...figures, EndBlock] : [EndBlock, ...Reverse(figures)];
            insert(blockNode !== null && blockNode !== void 0 ? blockNode : self.GetBody(), ...insertions);
            if (!DOM.Element.Figure.Is(StartBlock) && IsEmpty(DOM.GetText(StartBlock)))
                DOM.Remove(StartBlock);
            if (!DOM.Element.Figure.Is(EndBlock) && IsEmpty(DOM.GetText(EndBlock)))
                DOM.Remove(EndBlock);
            finish();
        };
        const OnLoadAndErrorEvents = (media, loadCallback) => {
            const loadOrErrorEvent = () => {
                if (IsFunction(loadCallback))
                    loadCallback(media);
                PartsTool.ChangePositions();
                DOM.Off(media, RichEditor.NativeEventMap.loadeddata, loadOrErrorEvent);
                DOM.Off(media, RichEditor.NativeEventMap.load, loadOrErrorEvent);
                DOM.Off(media, RichEditor.NativeEventMap.error, loadOrErrorEvent);
            };
            DOM.On(media, RichEditor.NativeEventMap.loadeddata, loadOrErrorEvent);
            DOM.On(media, RichEditor.NativeEventMap.load, loadOrErrorEvent);
            DOM.On(media, RichEditor.NativeEventMap.error, loadOrErrorEvent);
        };
        const createMedia = (opts) => {
            const { tagName, attrs, styles } = opts;
            const media = DOM.Create(tagName, {
                attrs: (IsObject(attrs) ? attrs : {}),
                styles: (IsObject(styles) ? styles : {}),
            });
            media.draggable = true;
            return media;
        };
        const ChangeFigure = (figure, opts) => {
            const { loadCallback } = opts;
            Each(DOM.GetChildren(figure), removable => DOM.Remove(removable, true));
            const media = createMedia(opts);
            const parts = PartsTool.Create('media', media);
            DOM.Insert(figure, media, parts);
            OnLoadAndErrorEvents(media, loadCallback);
        };
        const CreateViaURL = (url, opts) => {
            const { loadCallback } = opts;
            const figure = DOM.Element.Figure.Create('media');
            figure.draggable = true;
            if (!opts.attrs)
                opts.attrs = {};
            opts.attrs.src = url;
            const media = createMedia(opts);
            const parts = PartsTool.Create('media', media);
            OnLoadAndErrorEvents(media, loadCallback);
            media.src = new URL(media.src).href;
            DOM.Insert(figure, media, parts);
            completeCreation(figure);
        };
        const CreateFromFiles = (files, extensions, opts) => {
            const { loadCallback } = opts;
            const figures = [];
            Each(files.GetList(), file => {
                if (!Contains(extensions, '*') && !Contains(extensions, file.GetType()))
                    return;
                const figure = DOM.Element.Figure.Create('media');
                figure.draggable = true;
                if (!opts.attrs)
                    opts.attrs = {};
                opts.attrs.title = file.GetName();
                const media = createMedia(opts);
                const parts = PartsTool.Create('media', media);
                file.Read('DataURL', result => {
                    if (!IsString(result))
                        return DOM.Remove(figure, true);
                    media.src = result;
                    OnLoadAndErrorEvents(media, loadCallback);
                });
                DOM.Insert(figure, media, parts);
                Push(figures, figure);
            });
            completeCreation(...figures);
        };
        return {
            OnLoadAndErrorEvents,
            ChangeFigure,
            CreateViaURL,
            CreateFromFiles,
        };
    };

    const MediaStyles = (editor, format) => {
        const self = editor;
        const DOM = self.DOM;
        const { Styles, SameStyles, bAsText } = format;
        const wrapStyle = (media) => {
            const figure = DOM.Element.Figure.FindClosest(media);
            if (!figure)
                return null;
            DOM.RemoveStyles(figure, ...SameStyles);
            const toggleAttr = bAsText ? DOM.SetAttr : DOM.RemoveAttr;
            toggleAttr(figure, Options$1.ATTRIBUTES.AS_TEXT);
            DOM.SetStyles(figure, Styles);
            return figure;
        };
        const unwrapStyle = (media) => {
            const figure = DOM.Element.Figure.FindClosest(media);
            if (!figure)
                return null;
            if (bAsText)
                DOM.RemoveAttr(figure, Options$1.ATTRIBUTES.AS_TEXT);
            DOM.RemoveStyles(figure, ...Keys(Styles));
            return figure;
        };
        const Toggle = (bWrap, media) => {
            const toggle = bWrap ? wrapStyle : unwrapStyle;
            const figure = toggle(media);
            if (figure)
                return self.Utils.Shared.DispatchCaretChange([figure]);
            self.Tools.Parts.ChangePositions();
        };
        return {
            Toggle,
        };
    };

    const Commands = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const styleCommands = [
            { Name: COMMAND_NAMES_MAP.FLOAT_LEFT, Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
            { Name: COMMAND_NAMES_MAP.FLOAT_RIGHT, Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
            { Name: COMMAND_NAMES_MAP.ALIGN_LEFT, Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
            { Name: COMMAND_NAMES_MAP.ALIGN_CENTER, Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
            { Name: COMMAND_NAMES_MAP.ALIGN_RIGHT, Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
        ];
        const createStyleCommand = (format) => (bActive, node) => {
            const { FigureElement } = DOM.Element.Figure.Find(node);
            if (!FigureElement)
                return null;
            const toggler = MediaStyles(self, format);
            toggler.Toggle(bActive, FigureElement);
        };
        const createLoadCallback = (total, callback) => {
            const flagId = self.History.Flag();
            let numLoaded = 0;
            return (media) => {
                if (IsFunction(callback))
                    callback(media);
                ++numLoaded;
                if (total > numLoaded)
                    return;
                self.History.ChangeData(flagId, self.History.CreateData());
                self.History.Unflag();
            };
        };
        const createMediaLoadCallback = (width, height) => createLoadCallback(1, (media) => {
            if (DOM.Utils.IsVideo(media)) {
                media.controls = true;
                return;
            }
            DOM.SetAttr(media, Options$1.ATTRIBUTES.ORIGINAL_WIDTH, width.toString());
            DOM.SetAttr(media, Options$1.ATTRIBUTES.ORIGINAL_HEIGHT, height.toString());
            DOM.SetStyles(media, {
                width: `${width}px`,
                height: `${height}px`,
            });
        });
        const getMatchedURL = (url) => {
            var _a, _b, _c;
            const matchedURL = URLMatcher$1.Match(url);
            const format = (_a = matchedURL.Format) !== null && _a !== void 0 ? _a : 'video';
            const width = (_b = matchedURL.Width) !== null && _b !== void 0 ? _b : 640;
            const height = (_c = matchedURL.Height) !== null && _c !== void 0 ? _c : 360;
            return {
                URL: matchedURL.URL,
                format,
                width,
                height,
            };
        };
        const createImageCommand = (url) => {
            const mediaFormat = Media(self);
            mediaFormat.CreateViaURL(url, { tagName: 'img' });
        };
        const createImageUploadCommand = (fileList, allowedExtensions) => {
            if (IsEmpty$1(fileList))
                return;
            const files = BlobList(...fileList);
            const mediaFormat = Media(self);
            mediaFormat.CreateFromFiles(files, allowedExtensions, {
                tagName: 'img',
                loadCallback: createLoadCallback(files.GetLength()),
            });
        };
        const createImageUpdateCommand = (url, node) => {
            const { Figure, FigureElement } = DOM.Element.Figure.Find(node);
            if (!Figure || !DOM.Utils.IsImage(FigureElement))
                return;
            const mediaFormat = Media(self);
            FigureElement.src = url;
            mediaFormat.OnLoadAndErrorEvents(FigureElement, createLoadCallback(1));
        };
        const createMediaCommand = (url) => {
            const mediaFormat = Media(self);
            const matchedURL = getMatchedURL(url);
            mediaFormat.CreateViaURL(matchedURL.URL, {
                tagName: matchedURL.format,
                loadCallback: createMediaLoadCallback(matchedURL.width, matchedURL.height)
            });
        };
        const createMediaUpdateCommand = (url, node) => {
            const { Figure, FigureElement } = DOM.Element.Figure.Find(node);
            if (!Figure || (!DOM.Utils.IsIFrame(FigureElement) && !DOM.Utils.IsVideo(FigureElement)))
                return;
            const mediaFormat = Media(self);
            const matchedURL = getMatchedURL(url);
            const loadCallback = createMediaLoadCallback(matchedURL.width, matchedURL.height);
            if (DOM.Utils.GetNodeName(FigureElement) === matchedURL.format) {
                FigureElement.src = matchedURL.URL;
                return mediaFormat.OnLoadAndErrorEvents(FigureElement, loadCallback);
            }
            mediaFormat.ChangeFigure(Figure, {
                tagName: matchedURL.format,
                attrs: { src: matchedURL.URL },
                loadCallback
            });
        };
        const createRemoveCommand = (node) => DOM.Element.Figure.Remove(self, node);
        Each(styleCommands, command => self.Commander.Register(command.Name, createStyleCommand(command)));
        const Register = (type) => {
            switch (type) {
                case 'Image':
                    self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_CREATE, createImageCommand);
                    self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_UPLOAD, createImageUploadCommand);
                    self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_UPDATE, createImageUpdateCommand);
                    return self.Commander.Register(COMMAND_NAMES_MAP.IMAGE_REMOVE, createRemoveCommand);
                case 'Media':
                    self.Commander.Register(COMMAND_NAMES_MAP.MEDIA_CREATE, createMediaCommand);
                    self.Commander.Register(COMMAND_NAMES_MAP.MEDIA_UPDATE, createMediaUpdateCommand);
                    return self.Commander.Register(COMMAND_NAMES_MAP.MEDIA_REMOVE, createRemoveCommand);
            }
        };
        return {
            Register,
        };
    };

    const UI = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const formatUI = self.Formatter.UI;
        const ACTIVE_CLASS = formatUI.ACTIVE_CLASS;
        const DISABLED_ATTRIBUTE = formatUI.DISABLED_ATTRIBUTE;
        const CreateFormatButton = (uiFormat) => {
            const { Title, Icon } = uiFormat;
            const Wrapper = formatUI.CreateIconWrap(Title);
            const Button = formatUI.CreateIconButton(Title, Icon);
            const Helper = formatUI.CreateHelper(Title);
            DOM.Insert(Wrapper, Button, Helper);
            return {
                Wrapper,
                Button,
                Helper,
            };
        };
        const RegisterCommand = formatUI.RegisterCommand;
        const RunCommand = formatUI.RunCommand;
        const BindClickEvent = (event, ...uiList) => Each(uiList, ui => formatUI.BindClickEvent(ui, event));
        return {
            ACTIVE_CLASS,
            DISABLED_ATTRIBUTE,
            CreateFormatButton,
            RegisterCommand,
            RunCommand,
            BindClickEvent,
        };
    };

    const ImageUploader = (editor, ui) => {
        const self = editor;
        const DOM = self.DOM;
        const formatter = self.Formatter;
        const formatUI = formatter.UI;
        const uiName = 'Image';
        const uiFormat = {
            Title: self.Lang('plugins.media.image.title', 'Insert/Upload an image'),
            Icon: 'Image'
        };
        const mimeTypes = ['jpeg', 'png', 'gif', 'bmp', 'svg+xml', 'webp', 'tiff', 'x-icon', 'vnd.microsoft.icon'];
        const getConfiguration = () => {
            if (!IsObject(self.Config.ImageConfiguration))
                return {};
            return self.Config.ImageConfiguration;
        };
        const configuration = getConfiguration();
        const bMultiple = IsBoolean(configuration.multiple) ? configuration.multiple : true;
        const allowedExtensions = GetAllowedExtensions(mimeTypes, configuration.accept);
        const uploadCallback = configuration.uploadCallback;
        const inputOptions = {
            attrs: {
                type: 'file',
                accept: allowedExtensions,
            }
        };
        if (bMultiple)
            inputOptions.attrs.multiple = 'true';
        const fileInput = DOM.Create('input', inputOptions);
        DOM.On(fileInput, RichEditor.NativeEventMap.change, () => {
            const fileList = fileInput.files;
            if (!fileList)
                return;
            const files = Convert(bMultiple ? fileList : [fileList[0]]);
            if (!IsFunction(uploadCallback)) {
                self.Commander.Run(COMMAND_NAMES_MAP.IMAGE_UPLOAD, files, allowedExtensions);
                fileInput.value = '';
                return;
            }
            uploadCallback(BlobList(...files))
                .then(url => self.Commander.Run(COMMAND_NAMES_MAP.IMAGE_CREATE, url))
                .catch(error => self.Notification.Dispatch(self.Notification.STATUS_MAP.ERROR, error, false));
        });
        const createOptionList = (wrapper) => () => {
            const figureElement = DOM.Element.Figure.SelectFigureElement(self.Tools.Parts.SelectFocused(false, 'media'));
            const bUpdatable = DOM.Utils.IsImage(figureElement);
            const createImage = (input) => {
                const commandName = !bUpdatable ? COMMAND_NAMES_MAP.IMAGE_CREATE : COMMAND_NAMES_MAP.IMAGE_UPDATE;
                self.Commander.Run(commandName, input.value, figureElement);
            };
            const removeImage = () => {
                if (!figureElement)
                    return;
                self.Commander.Run(COMMAND_NAMES_MAP.IMAGE_REMOVE, figureElement);
            };
            const placeholderUpdate = self.Lang('plugins.media.image.update', 'Update the image URL');
            const placeholderInsert = self.Lang('plugins.media.image.insert', 'Insert an image via URL');
            const { OptionWrapper, Input } = formatUI.CreateInputWrapWithOptionList(self, {
                uiName,
                bUpdatable,
                createCallback: createImage,
                removeCallback: removeImage,
                src: bUpdatable ? figureElement.src : undefined,
                texts: {
                    placeholder: bUpdatable ? placeholderUpdate : placeholderInsert,
                    cancel: self.Lang('cancel', 'Cancel'),
                    insert: self.Lang('insert', 'Insert'),
                    update: self.Lang('update', 'Update'),
                    remove: self.Lang('remove', 'Remove'),
                }
            });
            DOM.Insert(self.Frame.Root, OptionWrapper);
            formatUI.SetOptionListCoordinate(self, uiName, wrapper, OptionWrapper);
            Input.focus();
            return OptionWrapper;
        };
        const iconWrap = ui.CreateFormatButton(uiFormat);
        ui.BindClickEvent(() => {
            formatUI.DestoryOpenedOptionList(self);
            fileInput.click();
        }, iconWrap.Button);
        formatUI.BindOptionListEvent(self, {
            type: uiName,
            activable: iconWrap.Wrapper,
            clickable: iconWrap.Helper,
            create: createOptionList(iconWrap.Wrapper)
        });
        self.Toolbar.Add(uiName, iconWrap.Wrapper);
    };

    const MediaInserter = (editor, ui) => {
        const self = editor;
        const DOM = self.DOM;
        const formatter = self.Formatter;
        const formatUI = formatter.UI;
        const uiName = 'Media';
        const uiFormat = {
            Title: self.Lang('plugins.media.title', 'Insert/Edit a media'),
            Icon: 'Media'
        };
        const createOptionList = (wrapper) => () => {
            const figure = self.Tools.Parts.SelectFocused(false, 'media');
            const figureElement = DOM.Element.Figure.SelectFigureElement(figure);
            const bUpdatable = DOM.Element.Figure.Is(figure) && (DOM.Utils.IsIFrame(figureElement) || DOM.Utils.IsVideo(figureElement));
            const createMedia = (input) => {
                const commandName = !bUpdatable ? COMMAND_NAMES_MAP.MEDIA_CREATE : COMMAND_NAMES_MAP.MEDIA_UPDATE;
                self.Commander.Run(commandName, input.value, figureElement);
            };
            const removeMedia = () => {
                if (!figure)
                    return;
                self.Commander.Run(COMMAND_NAMES_MAP.MEDIA_REMOVE, figure);
            };
            const placeholderUpdate = self.Lang('plugins.media.update', 'Update the media URL');
            const placeholderInsert = self.Lang('plugins.media.insert', 'Insert a media via URL');
            const { OptionWrapper, Input } = formatUI.CreateInputWrapWithOptionList(self, {
                uiName,
                bUpdatable,
                createCallback: createMedia,
                removeCallback: removeMedia,
                src: bUpdatable ? figureElement.src : undefined,
                texts: {
                    placeholder: bUpdatable ? placeholderUpdate : placeholderInsert,
                    cancel: self.Lang('cancel', 'Cancel'),
                    insert: self.Lang('insert', 'Insert'),
                    update: self.Lang('update', 'Update'),
                    remove: self.Lang('remove', 'Remove'),
                }
            });
            DOM.Insert(self.Frame.Root, OptionWrapper);
            formatUI.SetOptionListCoordinate(self, uiName, wrapper, OptionWrapper);
            Input.focus();
            return OptionWrapper;
        };
        const iconWrap = ui.CreateFormatButton(uiFormat);
        DOM.SetAttr(iconWrap.Wrapper, 'no-border');
        formatUI.BindOptionListEvent(self, {
            type: uiName,
            activable: iconWrap.Wrapper,
            clickable: iconWrap.Wrapper,
            create: createOptionList(iconWrap.Wrapper)
        });
        self.Toolbar.Add(uiName, iconWrap.Wrapper);
    };

    const MediaMenu = (editor, ui) => {
        const self = editor;
        const DOM = self.DOM;
        const uiFormats = {
            Float: [
                { Title: GetMenuText(self, 'floatLeft', 'Align left with text wrapping'), CommandName: COMMAND_NAMES_MAP.FLOAT_LEFT, Icon: 'MediaFloatLeft' },
                { Title: GetMenuText(self, 'floatRight', 'Align right with text wrapping'), CommandName: COMMAND_NAMES_MAP.FLOAT_RIGHT, Icon: 'MediaFloatRight' },
            ],
            Alignment: [
                { Title: GetMenuText(self, 'alignLeft', 'Align left with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_LEFT, Icon: 'MediaAlignLeft' },
                { Title: GetMenuText(self, 'alignCenter', 'Align center with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_CENTER, Icon: 'MediaAlignCenter' },
                { Title: GetMenuText(self, 'alignRight', 'Align right with text break'), CommandName: COMMAND_NAMES_MAP.ALIGN_RIGHT, Icon: 'MediaAlignRight' },
            ]
        };
        const createGroup = (mediaMenu, formats) => {
            const group = DOM.Create('div', {
                class: DOM.Utils.CreateUEID('icon-group', false)
            });
            Each(formats, format => {
                const { Title, CommandName, Icon } = format;
                const button = DOM.Create('button', {
                    attrs: {
                        title: Title,
                    },
                    class: DOM.Utils.CreateUEID('icon-button', false),
                    html: RichEditor.Icons.Get(Icon)
                });
                DOM.On(button, RichEditor.NativeEventMap.click, event => {
                    RichEditor.PreventEvent(event);
                    const bActive = !DOM.HasClass(button, ui.ACTIVE_CLASS);
                    self.Commander.Run(CommandName, bActive, mediaMenu);
                    const otherButtons = DOM.SelectAll({
                        class: DOM.Utils.CreateUEID('icon-button', false)
                    }, mediaMenu);
                    Each(otherButtons, otherButton => DOM.RemoveClass(otherButton, ui.ACTIVE_CLASS));
                    const toggleClass = bActive ? DOM.AddClass : DOM.RemoveClass;
                    toggleClass(button, ui.ACTIVE_CLASS);
                });
                DOM.Insert(group, button);
            });
            return group;
        };
        const createGroupWithoutFormat = (mediaMenu) => {
            const group = DOM.Create('div', {
                class: DOM.Utils.CreateUEID('icon-group', false)
            });
            const button = DOM.Create('button', {
                attrs: [
                    Options$1.ATTRIBUTES.REMOVE,
                    { title: GetMenuText(self, 'remove.figure', 'Remove the figure') }
                ],
                class: DOM.Utils.CreateUEID('icon-button', false),
                html: RichEditor.Icons.Get(RichEditor.Icons.Get('Trash'))
            });
            DOM.On(button, RichEditor.NativeEventMap.click, event => {
                RichEditor.PreventEvent(event);
                self.Commander.Run(COMMAND_NAMES_MAP.MEDIA_REMOVE, mediaMenu);
            });
            DOM.Insert(group, button);
            return group;
        };
        const Create = () => {
            const mediaMenu = DOM.Create('div', {
                attrs: [Options$1.ATTRIBUTES.PARTS_MENU]
            });
            Values(uiFormats, formats => DOM.Insert(mediaMenu, createGroup(mediaMenu, formats)));
            DOM.Insert(mediaMenu, createGroupWithoutFormat(mediaMenu));
            return mediaMenu;
        };
        return {
            Create,
        };
    };

    const Setup = (editor) => {
        const self = editor;
        const pluginManager = self.Plugin;
        const partsManager = self.Tools.Parts.Manager;
        const formatUtils = self.Formatter.Utils;
        const ui = UI(self);
        const formatNames = ['Image', 'Media'];
        const parts = MediaMenu(self, ui);
        partsManager.Attach({
            name: 'media',
            partAttachers: [parts.Create],
        });
        if (IsArray(self.Config.MediaUrlPatterns)) {
            const matchers = self.Config.MediaUrlPatterns;
            Each(matchers, matcher => URLMatcher$1.Add(matcher));
        }
        const createUi = (name) => {
            if (!formatUtils.HasFormatName(name, formatNames))
                return;
            const uiName = formatUtils.GetFormatName(name, formatNames);
            const commands = Commands(self);
            switch (uiName) {
                case formatNames[0]:
                    commands.Register(formatNames[0]);
                    ImageUploader(self, ui);
                    break;
                case formatNames[1]:
                    commands.Register(formatNames[1]);
                    MediaInserter(self, ui);
                    break;
            }
        };
        Each(formatNames, name => pluginManager.Add(name, createUi));
    };

    var Plugin = () => RichEditor.Loaders.Plugin.Add('media', (editor) => Setup(editor));

    Plugin();

})();
