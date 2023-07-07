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
    const IsString = isType('string');
    const IsFunction = isType('function');

    const IsEmpty = (value) => IsArray(value) && value.length === 0;
    const Each = (array, callback) => {
        const length = array.length;
        for (let index = 0; index < length; ++index) {
            const value = array[index];
            callback(value, () => { index = length; });
        }
    };
    const Push = (array, ...items) => array.push(...items);
    const Shift = (array) => array.shift();
    const WhileShift = (array, callback) => {
        let currentItem;
        let bBreak = false;
        const exit = () => { bBreak = true; };
        while (!IsEmpty(array)) {
            currentItem = Shift(array);
            if (!currentItem)
                continue;
            callback(currentItem, exit);
            if (bBreak)
                break;
        }
    };
    const Convert = (array) => Array.from(array);

    const GetProperty = (obj, key) => { var _a; return (_a = Object.assign(obj !== null && obj !== void 0 ? obj : {})) === null || _a === void 0 ? void 0 : _a[key]; };

    const Join = (attacher, ...args) => args.join(attacher);
    const Merge = (...args) => Join('', ...args);

    const URL_REGEX = /^((?:https?|ftp):\/\/|mailto:)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/i;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PROTOCOL_REGEX = /^(https?|ftp|mailto):/;
    const IsURL = (value) => URL_REGEX.test(value);
    const IsEmail = (value) => EMAIL_REGEX.test(value);
    const HasProtocol = (value) => PROTOCOL_REGEX.test(value);
    const ConvertURL = (value) => {
        if (IsURL(value))
            return HasProtocol(value) ? value : Merge('https://', value);
        if (IsEmail(value))
            return Merge('mailto:', value);
        return value;
    };

    var ENodeTypeMap;
    (function (ENodeTypeMap) {
        ENodeTypeMap[ENodeTypeMap["UNKNOWN"] = 0] = "UNKNOWN";
        ENodeTypeMap[ENodeTypeMap["ELEMENT"] = 1] = "ELEMENT";
        ENodeTypeMap[ENodeTypeMap["ATTRIBUTE"] = 2] = "ATTRIBUTE";
        ENodeTypeMap[ENodeTypeMap["TEXT"] = 3] = "TEXT";
        ENodeTypeMap[ENodeTypeMap["CDATA_SECTION"] = 4] = "CDATA_SECTION";
        ENodeTypeMap[ENodeTypeMap["ENTITY_REFERENCE"] = 5] = "ENTITY_REFERENCE";
        ENodeTypeMap[ENodeTypeMap["ENTITY"] = 6] = "ENTITY";
        ENodeTypeMap[ENodeTypeMap["PROCESSING_INSTRUCTION"] = 7] = "PROCESSING_INSTRUCTION";
        ENodeTypeMap[ENodeTypeMap["COMMENT"] = 8] = "COMMENT";
        ENodeTypeMap[ENodeTypeMap["DOCUMENT"] = 9] = "DOCUMENT";
        ENodeTypeMap[ENodeTypeMap["DOCUMENT_TYPE"] = 10] = "DOCUMENT_TYPE";
        ENodeTypeMap[ENodeTypeMap["DOCUMENT_FRAGMENT"] = 11] = "DOCUMENT_FRAGMENT";
        ENodeTypeMap[ENodeTypeMap["NOTATION"] = 12] = "NOTATION";
    })(ENodeTypeMap || (ENodeTypeMap = {}));
    const getNodeType = (value) => { var _a; return (_a = GetProperty(value, 'nodeType')) !== null && _a !== void 0 ? _a : ENodeTypeMap.UNKNOWN; };
    const is = (type) => (value) => getNodeType(value) === type;
    is(ENodeTypeMap.ELEMENT);
    is(ENodeTypeMap.ATTRIBUTE);
    const IsText = is(ENodeTypeMap.TEXT);
    is(ENodeTypeMap.CDATA_SECTION);
    is(ENodeTypeMap.ENTITY_REFERENCE);
    is(ENodeTypeMap.ENTITY);
    is(ENodeTypeMap.PROCESSING_INSTRUCTION);
    is(ENodeTypeMap.COMMENT);
    is(ENodeTypeMap.DOCUMENT);
    is(ENodeTypeMap.DOCUMENT_TYPE);
    is(ENodeTypeMap.DOCUMENT_FRAGMENT);
    is(ENodeTypeMap.NOTATION);

    const AnchorUtils = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const formats = self.Formatter.Formats;
        const formatUtils = self.Formatter.Utils;
        const ClosestBlock = (node) => {
            var _a;
            return (_a = DOM.Closest(formatUtils.GetParentIfText(node), { tagName: Convert(formats.BlockFormatTags.Block) })) !== null && _a !== void 0 ? _a : DOM.Closest(formatUtils.GetParentIfText(node), formats.ListItemSelector);
        };
        const UnwrapAnchor = (targetAnchor) => Each(editor.DOM.SelectAll('a', targetAnchor), anchor => {
            const fragment = editor.DOM.CreateFragment();
            const parent = anchor.parentNode;
            editor.DOM.Insert(fragment, ...editor.DOM.GetChildNodes(anchor));
            parent === null || parent === void 0 ? void 0 : parent.replaceChild(fragment, anchor);
        });
        const TrimTextsRangeEdge = (node, offset, bPrevious = false) => {
            const text = node.textContent;
            if (!text)
                return node;
            const splitedTextNode = formatUtils.SplitTextNode(self, node, bPrevious ? offset : 0, bPrevious ? text.length : offset);
            if (!splitedTextNode)
                return node;
            return splitedTextNode;
        };
        const FindSibling = (node, bPrevious) => {
            let foundSibling = node;
            while (foundSibling) {
                const sibling = bPrevious ? foundSibling.previousSibling : foundSibling.nextSibling;
                if (sibling) {
                    foundSibling = sibling;
                    break;
                }
                foundSibling = foundSibling.parentNode;
            }
            if (IsText(foundSibling) || DOM.Utils.IsBr(foundSibling))
                return foundSibling;
            const getChild = bPrevious ? DOM.Utils.GetLastChild : DOM.Utils.GetFirstChild;
            return getChild(foundSibling, true);
        };
        const PutNodesIntoFragment = (node, until, bPrevious) => {
            var _a;
            const fragment = DOM.CreateFragment();
            let siblingForInsertion = null;
            let current = node.parentNode;
            let sibling = node;
            const insert = bPrevious ? DOM.InsertFirst : DOM.Insert;
            const insertReverse = bPrevious ? DOM.Insert : DOM.InsertFirst;
            while (current && current !== self.GetBody()) {
                const cloned = DOM.Clone(current);
                if (current === until)
                    siblingForInsertion = (_a = (bPrevious ? sibling === null || sibling === void 0 ? void 0 : sibling.nextSibling : sibling === null || sibling === void 0 ? void 0 : sibling.previousSibling)) !== null && _a !== void 0 ? _a : null;
                while (sibling) {
                    const nextSibling = bPrevious ? sibling.previousSibling : sibling.nextSibling;
                    insert(cloned, sibling);
                    sibling = nextSibling;
                }
                if (DOM.Utils.HasChildNodes(fragment))
                    insertReverse(cloned, ...DOM.GetChildNodes(fragment));
                if (current === until) {
                    DOM.Insert(fragment, ...DOM.GetChildNodes(cloned));
                    break;
                }
                DOM.Insert(fragment, cloned);
                sibling = bPrevious ? current.previousSibling : current.nextSibling;
                current = current.parentNode;
            }
            return [fragment, siblingForInsertion];
        };
        const ToggleAllInLine = (block, until, bNext, toggle, checkExit) => {
            let currentNode = block;
            while (currentNode) {
                const parent = currentNode.parentNode;
                const sibling = bNext ? currentNode.nextSibling : currentNode.previousSibling;
                if (!sibling) {
                    if (parent === until)
                        break;
                    currentNode = parent;
                    continue;
                }
                if (IsFunction(checkExit) && checkExit(sibling))
                    break;
                toggle(sibling);
                currentNode = sibling;
            }
        };
        return {
            ClosestBlock,
            UnwrapAnchor,
            TrimTextsRangeEdge,
            FindSibling,
            PutNodesIntoFragment,
            ToggleAllInLine,
        };
    };

    const Unwrapper = (editor, utils) => {
        const self = editor;
        const DOM = self.DOM;
        const formatUtils = self.Formatter.Utils;
        const CaretUtils = self.Utils.Caret;
        const RangeUtils = self.Utils.Range;
        const unwrapAll = (node) => {
            const parentIfText = formatUtils.GetParentIfText(node);
            const anchors = DOM.SelectAll('a', parentIfText);
            Each(anchors, anchor => {
                var _a;
                const fragment = DOM.CreateFragment();
                DOM.Insert(fragment, ...DOM.GetChildNodes(anchor));
                (_a = anchor.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(fragment, anchor);
            });
        };
        const sameProcessor = (startNode, endNode, until) => {
            const fragments = [null, null, null];
            const foundPreviousSibling = utils.FindSibling(startNode, true);
            const foundNextSibling = utils.FindSibling(endNode, false);
            if (foundPreviousSibling)
                fragments[0] = utils.PutNodesIntoFragment(foundPreviousSibling, until, true)[0];
            if (foundNextSibling)
                Push(fragments, utils.PutNodesIntoFragment(foundNextSibling, until, false)[0]);
            const startFragment = utils.PutNodesIntoFragment(startNode, until, true)[0];
            utils.UnwrapAnchor(startFragment);
            fragments[1] = startFragment;
            if (startNode !== endNode) {
                const endFragment = utils.PutNodesIntoFragment(endNode, until, true)[0];
                utils.UnwrapAnchor(endFragment);
                fragments[2] = endFragment;
            }
            DOM.Insert(until, ...fragments);
        };
        const sameNodeProcessor = (caret) => {
            if (!caret.IsRange() || caret.Start.Node !== caret.End.Node)
                return false;
            const node = caret.Start.Node;
            const splitedTextNode = formatUtils.SplitTextNode(self, node, caret.Start.Offset, caret.End.Offset);
            if (!IsText(splitedTextNode))
                return false;
            const newRange = RangeUtils();
            const closestAnchor = DOM.Closest(formatUtils.GetParentIfText(splitedTextNode), 'a');
            const until = utils.ClosestBlock(splitedTextNode);
            if (!closestAnchor || !until)
                return false;
            sameProcessor(splitedTextNode, splitedTextNode, until);
            newRange.SetStartToEnd(splitedTextNode, 0, splitedTextNode.length);
            CaretUtils.UpdateRange(newRange);
            return true;
        };
        const sameLineProcessor = (startNode, endNode, until) => {
            var _a, _b;
            sameProcessor(startNode, endNode, until);
            const newRange = RangeUtils();
            newRange.SetStart(startNode, 0);
            newRange.SetEnd(endNode, (_b = (_a = endNode.textContent) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
            CaretUtils.UpdateRange(newRange);
            return true;
        };
        const trimRangeEdge = (node, until, bStart) => {
            const [fragment, siblingForInsertion] = utils.PutNodesIntoFragment(node, until, !bStart);
            utils.UnwrapAnchor(fragment);
            const insertIn = bStart ? DOM.Insert : DOM.InsertFirst;
            const insertNext = bStart ? DOM.InsertAfter : DOM.InsertBefore;
            const insert = !!siblingForInsertion ? insertNext : insertIn;
            insert(siblingForInsertion !== null && siblingForInsertion !== void 0 ? siblingForInsertion : until, fragment);
        };
        const rangeProcessor = (caret) => {
            var _a, _b, _c, _d;
            if (!caret.IsRange())
                return false;
            const startNode = utils.TrimTextsRangeEdge(caret.Start.Node, caret.Start.Offset, true);
            const endNode = utils.TrimTextsRangeEdge(caret.End.Node, caret.End.Offset);
            caret.Range.SetStart(startNode, startNode === caret.Start.Node ? caret.Start.Offset : 0);
            caret.Range.SetEnd(endNode, (_b = (_a = endNode.textContent) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
            const startUntil = utils.ClosestBlock(startNode);
            const endUntil = utils.ClosestBlock(endNode);
            if (!startUntil || !endUntil)
                return false;
            if (startUntil === endUntil) {
                sameLineProcessor(startNode, endNode, startUntil);
                return true;
            }
            trimRangeEdge(startNode, startUntil, true);
            let currentNode = startUntil;
            while (currentNode) {
                const parent = currentNode.parentNode;
                const sibling = currentNode.nextSibling;
                if (!sibling) {
                    if (parent === self.GetBody())
                        break;
                    currentNode = parent;
                    continue;
                }
                if (DOM.Utils.IsChildOf(endUntil, sibling))
                    break;
                unwrapAll(sibling);
                currentNode = sibling;
            }
            currentNode = endUntil;
            while (currentNode) {
                const parent = currentNode.parentNode;
                const sibling = currentNode.previousSibling;
                if (!sibling) {
                    if (parent === caret.End.Path[0])
                        break;
                    currentNode = parent;
                    continue;
                }
                unwrapAll(sibling);
                currentNode = sibling;
            }
            trimRangeEdge(endNode, endUntil, false);
            const newRange = RangeUtils();
            newRange.SetStart(startNode, startNode === caret.Start.Node ? caret.Start.Offset : 0);
            newRange.SetEnd(endNode, (_d = (_c = endNode.textContent) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0);
            CaretUtils.UpdateRange(newRange);
            return true;
        };
        const caretProcessor = (caret) => {
            if (caret.IsRange())
                return false;
            const anchor = DOM.Closest(formatUtils.GetParentIfText(caret.Start.Node), 'a');
            if (!anchor)
                return false;
            formatUtils.RunFormatting(self, () => {
                var _a;
                const fragment = DOM.CreateFragment();
                DOM.Insert(fragment, ...DOM.GetChildNodes(anchor));
                (_a = anchor.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(fragment, anchor);
            });
            return true;
        };
        const UnwrapFromCaret = () => {
            const caret = CaretUtils.Get();
            if (!caret)
                return;
            const finish = () => {
                var _a;
                formatUtils.CleanDirtyWithCaret(self, (_a = CaretUtils.Get()) !== null && _a !== void 0 ? _a : caret);
                self.Focus();
            };
            if (caretProcessor(caret))
                return finish();
            if (sameNodeProcessor(caret))
                return finish();
            if (rangeProcessor(caret))
                return finish();
        };
        return {
            UnwrapFromCaret,
        };
    };

    const Wrapper = (editor, utils) => {
        const self = editor;
        const DOM = self.DOM;
        const formats = self.Formatter.Formats;
        const formatUtils = self.Formatter.Utils;
        const CaretUtils = self.Utils.Caret;
        const RangeUtils = self.Utils.Range;
        const createAnchor = (url, child) => {
            const anchor = DOM.Create('a', {
                attrs: { href: url },
                children: [child !== null && child !== void 0 ? child : null]
            });
            DOM.SetAttr(anchor, 'href', anchor.href);
            return anchor;
        };
        const mergeAnchors = () => {
            const anchors = DOM.SelectAll('a', self.GetBody());
            WhileShift(anchors, anchor => {
                const previous = anchor.previousElementSibling;
                if (!DOM.Utils.IsAnchor(previous) || previous.href !== anchor.href)
                    return;
                DOM.Insert(previous, ...DOM.GetChildNodes(anchor));
                DOM.Remove(anchor);
            });
        };
        const wrapRecursive = (node, url) => {
            var _a;
            const nodeName = DOM.Utils.GetNodeName(node);
            if (formats.AllDisableList.has(nodeName))
                return;
            if (formats.AllBlockFormats.has(nodeName) && !formats.BlockFormatTags.Block.has(nodeName))
                return Each(DOM.GetChildNodes(node), child => wrapRecursive(child, url));
            if (!formats.BlockFormatTags.Block.has(nodeName)) {
                const anchor = createAnchor(url);
                DOM.CloneAndInsert(anchor, true, node);
                utils.UnwrapAnchor(anchor);
                return (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.replaceChild(anchor, node);
            }
            const children = DOM.GetChildNodes(node);
            if (IsEmpty(children) || (children.length === 1 && DOM.Utils.IsBr(children[0])))
                return;
            const anchor = createAnchor(url);
            DOM.Insert(anchor, ...children);
            utils.UnwrapAnchor(anchor);
            DOM.Insert(node, anchor);
        };
        const tableProcessor = (url) => {
            const cells = DOM.Element.Table.GetSelectedCells(self);
            if (IsEmpty(cells))
                return false;
            Each(cells, cell => wrapRecursive(cell, url));
            return true;
        };
        const sameProcessor = (startNode, endNode, until, url) => {
            const fragments = [null, null, null];
            const foundPreviousSibling = utils.FindSibling(startNode, true);
            const foundNextSibling = utils.FindSibling(endNode, false);
            if (foundPreviousSibling)
                fragments[0] = utils.PutNodesIntoFragment(foundPreviousSibling, until, true)[0];
            if (foundNextSibling)
                Push(fragments, utils.PutNodesIntoFragment(foundNextSibling, until, false)[0]);
            const startAnchor = createAnchor(url, utils.PutNodesIntoFragment(startNode, until, true)[0]);
            utils.UnwrapAnchor(startAnchor);
            fragments[1] = startAnchor;
            if (startNode !== endNode) {
                const endAnchor = createAnchor(url, utils.PutNodesIntoFragment(endNode, until, true)[0]);
                utils.UnwrapAnchor(endAnchor);
                fragments[2] = endAnchor;
            }
            DOM.Insert(until, ...fragments);
        };
        const sameNodeProcessor = (caret, url) => {
            var _a;
            if (!caret.IsRange() || caret.Start.Node !== caret.End.Node)
                return false;
            const node = caret.Start.Node;
            const splitedTextNode = formatUtils.SplitTextNode(self, node, caret.Start.Offset, caret.End.Offset);
            if (!IsText(splitedTextNode))
                return false;
            const newRange = RangeUtils();
            const closestAnchor = DOM.Closest(formatUtils.GetParentIfText(splitedTextNode), 'a');
            const until = utils.ClosestBlock(splitedTextNode);
            if (!closestAnchor || !until) {
                const cloned = DOM.Clone(splitedTextNode);
                const anchor = createAnchor(url, cloned);
                (_a = splitedTextNode.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(anchor, splitedTextNode);
                newRange.SetStartToEnd(cloned, 0, splitedTextNode.length);
                CaretUtils.UpdateRange(newRange);
                return true;
            }
            sameProcessor(splitedTextNode, splitedTextNode, until, url);
            newRange.SetStartToEnd(splitedTextNode, 0, splitedTextNode.length);
            CaretUtils.UpdateRange(newRange);
            return true;
        };
        const sameLineProcessor = (startNode, endNode, startOffset, endOffset, until, url) => {
            sameProcessor(startNode, endNode, until, url);
            const newRange = RangeUtils();
            newRange.SetStart(startNode, startOffset);
            newRange.SetEnd(endNode, endOffset);
            CaretUtils.UpdateRange(newRange);
            return true;
        };
        const trimRangeEdge = (node, until, url, bStart) => {
            const [fragment, siblingForInsertion] = utils.PutNodesIntoFragment(node, until, !bStart);
            const anchor = createAnchor(url, fragment);
            utils.UnwrapAnchor(anchor);
            const insertIn = bStart ? DOM.Insert : DOM.InsertFirst;
            const insertNext = bStart ? DOM.InsertAfter : DOM.InsertBefore;
            const insert = !!siblingForInsertion ? insertNext : insertIn;
            insert(siblingForInsertion !== null && siblingForInsertion !== void 0 ? siblingForInsertion : until, anchor);
        };
        const rangeProcessor = (caret, url) => {
            var _a, _b;
            if (!caret.IsRange())
                return false;
            const startNode = utils.TrimTextsRangeEdge(caret.Start.Node, caret.Start.Offset, true);
            const endNode = utils.TrimTextsRangeEdge(caret.End.Node, caret.End.Offset);
            const startOffset = startNode === caret.Start.Node ? caret.Start.Offset : 0;
            const endOffset = endNode === caret.End.Node ? caret.End.Offset : ((_b = (_a = endNode.textContent) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
            caret.Range.SetStart(startNode, startOffset);
            caret.Range.SetEnd(endNode, endOffset);
            const startUntil = utils.ClosestBlock(startNode);
            const endUntil = utils.ClosestBlock(endNode);
            if (!startUntil || !endUntil)
                return false;
            if (startUntil === endUntil) {
                sameLineProcessor(startNode, endNode, startOffset, endOffset, startUntil, url);
                return true;
            }
            trimRangeEdge(startNode, startUntil, url, true);
            utils.ToggleAllInLine(startUntil, self.GetBody(), true, (sibling) => wrapRecursive(sibling, url), (sibling) => DOM.Utils.IsChildOf(endUntil, sibling));
            utils.ToggleAllInLine(endUntil, caret.End.Path[0], false, (sibling) => wrapRecursive(sibling, url), (sibling) => !DOM.Utils.IsChildOf(caret.End.Path[0], sibling));
            trimRangeEdge(endNode, endUntil, url, false);
            const newRange = RangeUtils();
            newRange.SetStart(startNode, startOffset);
            newRange.SetEnd(endNode, endOffset);
            CaretUtils.UpdateRange(newRange);
            return true;
        };
        const caretProcessor = (caret, url) => {
            var _a;
            if (caret.IsRange())
                return false;
            const existedAnchor = (_a = DOM.Closest(formatUtils.GetParentIfText(caret.Start.Node), 'a')) !== null && _a !== void 0 ? _a : DOM.Closest(formatUtils.GetParentIfText(caret.End.Node), 'a');
            if (existedAnchor) {
                if (DOM.GetHTML(existedAnchor) === DOM.GetAttr(existedAnchor, 'href'))
                    DOM.SetText(existedAnchor, url);
                DOM.SetAttr(existedAnchor, 'href', url);
                DOM.SetAttr(existedAnchor, 'href', existedAnchor.href);
                return true;
            }
            const anchor = createAnchor(url, DOM.CreateTextNode(url));
            caret.Range.Insert(anchor);
            const newRange = RangeUtils();
            newRange.SetStartToEnd(DOM.Utils.GetFirstChild(anchor), url.length, url.length);
            CaretUtils.UpdateRange(newRange);
            return true;
        };
        const WrapFromCaret = (url) => {
            if (tableProcessor(url))
                return;
            const caret = CaretUtils.Get();
            if (!caret)
                return;
            const finish = () => {
                var _a, _b;
                formatUtils.DoWithShallowMarking(self, (_a = CaretUtils.Get()) !== null && _a !== void 0 ? _a : caret, mergeAnchors);
                formatUtils.CleanDirtyWithCaret(self, (_b = CaretUtils.Get()) !== null && _b !== void 0 ? _b : caret);
                self.Focus();
            };
            if (caretProcessor(caret, url))
                return finish();
            if (sameNodeProcessor(caret, url))
                return finish();
            if (rangeProcessor(caret, url))
                return finish();
        };
        return {
            WrapFromCaret,
        };
    };

    const Toggler = (editor) => {
        const self = editor;
        const utils = AnchorUtils(self);
        const wrapper = Wrapper(self, utils);
        const unwrapper = Unwrapper(self, utils);
        const ToggleFromCaret = (bWrap, url) => {
            if (!bWrap)
                return unwrapper.UnwrapFromCaret();
            if (!IsString(url))
                return;
            const convertedURL = ConvertURL(url);
            wrapper.WrapFromCaret(convertedURL);
        };
        return {
            ToggleFromCaret
        };
    };

    const Link = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const CaretUtils = self.Utils.Caret;
        const formatter = self.Formatter;
        const formats = formatter.Formats;
        const Detector = formatter.Detector;
        const uiName = 'Link';
        const uiFormat = {
            Title: self.Lang('plugins.link.title', 'Insert/Edit a link'),
            CommandName: 'Hyperlink',
            Icon: 'Hyperlink'
        };
        const iconButton = formatter.UI.CreateIconButton(uiFormat.Title, uiFormat.Icon);
        const isDetected = (nodes) => {
            for (let index = 0, length = nodes.length; index < length; ++index) {
                const node = nodes[index];
                if (!DOM.Closest(node, 'a'))
                    continue;
                return true;
            }
            return false;
        };
        const createOptionList = () => {
            var _a;
            const caret = CaretUtils.Get();
            const anchor = !caret
                ? null
                : ((_a = DOM.Closest(formatter.Utils.GetParentIfText(caret.Start.Node), 'a')) !== null && _a !== void 0 ? _a : DOM.Closest(formatter.Utils.GetParentIfText(caret.End.Node), 'a'));
            const bUpdatable = DOM.Utils.IsAnchor(anchor);
            const createAnchor = (input) => formatter.UI.RunCommand(self, uiFormat.CommandName, true, input === null || input === void 0 ? void 0 : input.value);
            const removeAnchor = () => formatter.UI.RunCommand(self, uiFormat.CommandName, false);
            const placeholderUpdate = self.Lang('plugins.link.update', 'Update the link');
            const placeholderInsert = self.Lang('plugins.link.insert', 'Insert a link');
            const { OptionWrapper, Input } = formatter.UI.CreateInputWrapWithOptionList(self, {
                uiName,
                bUpdatable,
                createCallback: createAnchor,
                removeCallback: removeAnchor,
                src: bUpdatable ? anchor.href : undefined,
                texts: {
                    placeholder: bUpdatable ? placeholderUpdate : placeholderInsert,
                    cancel: self.Lang('cancel', 'Cancel'),
                    insert: self.Lang('insert', 'Insert'),
                    update: self.Lang('update', 'Update'),
                    remove: self.Lang('remove', 'Remove'),
                }
            });
            DOM.Insert(self.Frame.Root, OptionWrapper);
            formatter.UI.SetOptionListCoordinate(self, uiName, iconButton, OptionWrapper);
            Input.focus();
            return OptionWrapper;
        };
        const command = (bWrap, url) => {
            if (formatter.UI.IsDisabled(iconButton))
                return;
            const toggler = Toggler(self);
            toggler.ToggleFromCaret(bWrap, url);
            formatter.UI.ToggleActivateClass(iconButton, bWrap);
        };
        formatter.UI.RegisterCommand(self, uiFormat.CommandName, command);
        formatter.UI.BindOptionListEvent(self, {
            type: uiName,
            activable: iconButton,
            clickable: iconButton,
            create: createOptionList
        });
        Detector.Register((paths) => {
            formatter.UI.ToggleActivateClass(iconButton, isDetected(paths));
            const { Figure, FigureElement } = DOM.Element.Figure.Find(paths[0]);
            const bDisable = !!Figure && !!FigureElement && formats.AllDisableList.has(DOM.Utils.GetNodeName(FigureElement));
            formatter.UI.ToggleDisable(iconButton, bDisable);
        });
        self.Toolbar.Add(uiName, iconButton);
    };

    const Setup = (editor) => {
        const self = editor;
        const pluginManager = self.Plugin;
        const formatUtils = self.Formatter.Utils;
        const formatNames = ['Link'];
        const createUi = (name) => {
            if (!formatUtils.HasFormatName(name, formatNames))
                return;
            const uiName = formatUtils.GetFormatName(name, formatNames);
            switch (uiName) {
                case formatNames[0]:
                    Link(self);
                    break;
            }
        };
        Each(formatNames, name => pluginManager.Add(name, createUi));
    };

    var Plugin = () => RichEditor.Loaders.Plugin.Add('link', (editor) => Setup(editor));

    Plugin();

})();
