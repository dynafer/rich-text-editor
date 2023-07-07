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

    const IsEmpty = (value) => IsArray(value) && value.length === 0;
    const Each = (array, callback) => {
        const length = array.length;
        for (let index = 0; index < length; ++index) {
            const value = array[index];
            callback(value, () => { index = length; });
        }
    };
    const Push = (array, ...items) => array.push(...items);

    const GetProperty = (obj, key) => { var _a; return (_a = Object.assign(obj !== null && obj !== void 0 ? obj : {})) === null || _a === void 0 ? void 0 : _a[key]; };

    const Join = (attacher, ...args) => args.join(attacher);

    const Unwrapper = (editor, format) => {
        const self = editor;
        const DOM = self.DOM;
        const formatter = self.Formatter;
        const formatUtils = formatter.Utils;
        const { Tag, UnsetSwitcher } = format;
        const unwrap = (oldList, start, end, bTable = false) => {
            var _a, _b, _c;
            const startList = DOM.Create(Tag);
            const middleNodes = [];
            const endList = DOM.Create(Tag);
            const children = DOM.GetChildNodes(oldList);
            let bMiddle = false;
            let bEnd = false;
            Each(children, child => {
                if (DOM.Utils.IsChildOf(start, child))
                    bMiddle = true;
                if (bMiddle && !bEnd) {
                    Each(DOM.GetChildNodes(child), node => {
                        if (DOM.Utils.IsBr(node))
                            return;
                        Push(middleNodes, DOM.Clone(node, true));
                    });
                }
                else {
                    const addable = bEnd ? endList : startList;
                    DOM.CloneAndInsert(addable, true, child);
                }
                if (DOM.Utils.IsChildOf(end, child))
                    bEnd = true;
            });
            const bStartFromMiddle = !DOM.Utils.HasChildNodes(startList);
            if (!bStartFromMiddle)
                (_a = oldList.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(startList, oldList);
            let lastChildInMiddleNodes;
            if (bTable) {
                if (bStartFromMiddle)
                    (_b = oldList.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(middleNodes[0], oldList);
                else
                    DOM.InsertAfter(startList, middleNodes[0]);
                for (let index = 1, length = middleNodes.length; index < length; ++index) {
                    DOM.InsertAfter(middleNodes[index - 1], middleNodes[index]);
                }
                lastChildInMiddleNodes = middleNodes[middleNodes.length - 1];
            }
            else {
                const block = DOM.Create(UnsetSwitcher);
                DOM.Insert(block, ...middleNodes);
                if (bStartFromMiddle)
                    (_c = oldList.parentNode) === null || _c === void 0 ? void 0 : _c.replaceChild(block, oldList);
                else
                    DOM.InsertAfter(startList, block);
                lastChildInMiddleNodes = block;
            }
            if (DOM.Utils.HasChildNodes(endList))
                DOM.InsertAfter(lastChildInMiddleNodes, endList);
            return true;
        };
        const unwrapNodesInTable = (selectedList) => Each(selectedList, selected => {
            const lists = DOM.SelectAll(Tag, selected);
            if (IsEmpty(lists))
                return;
            Each(lists, list => {
                const firstChild = DOM.Utils.GetFirstChild(list);
                const lastChild = DOM.Utils.GetLastChild(list);
                if (!firstChild || !lastChild)
                    return;
                unwrap(list, firstChild, lastChild, true);
            });
        });
        const unwrapRange = (node, bFromFirst = false) => {
            if (!node)
                return;
            const target = formatUtils.GetParentIfText(node);
            const oldList = DOM.Closest(target, Tag);
            const table = DOM.Element.Table.FindClosest(target);
            if (!oldList || !!table)
                return;
            const children = DOM.GetChildNodes(oldList);
            const startChild = !bFromFirst ? node : children[0];
            const endChild = !bFromFirst ? children[children.length - 1] : node;
            unwrap(oldList, startChild, endChild, false);
        };
        const processSameLine = (caret) => {
            if (caret.Start.Line !== caret.End.Line)
                return false;
            const target = formatUtils.GetParentIfText(caret.Start.Node);
            const oldList = DOM.Closest(target, Tag);
            const table = DOM.Element.Table.FindClosest(target);
            if (!oldList && !table)
                return false;
            if (table) {
                const selectedTableItems = DOM.Element.Table.GetSelectedCells(self, table);
                if (!IsEmpty(selectedTableItems)) {
                    unwrapNodesInTable(selectedTableItems);
                    return true;
                }
            }
            const tableCell = DOM.Element.Table.FindClosestCell(target);
            if (!tableCell && oldList)
                return unwrap(oldList, caret.Start.Node, caret.End.Node);
            if (!tableCell)
                return false;
            const children = DOM.GetChildNodes(tableCell);
            let bStart = false;
            Each(children, (child, exit) => {
                const bHasStart = !!DOM.Utils.IsChildOf(caret.Start.Node, child);
                const bHasEnd = !!DOM.Utils.IsChildOf(caret.End.Node, child);
                if (bHasStart)
                    bStart = true;
                if (!bStart)
                    return;
                const firstChild = DOM.Utils.GetFirstChild(child);
                const lastChild = DOM.Utils.GetLastChild(child);
                if (DOM.Utils.GetNodeName(child) === Tag && firstChild && lastChild) {
                    const startNode = bHasStart ? caret.Start.Node : firstChild;
                    const endNode = bHasEnd ? caret.End.Node : lastChild;
                    unwrap(child, startNode, endNode, true);
                }
                if (bHasEnd)
                    exit();
            });
            return true;
        };
        const processRange = (caret) => {
            if (caret.Start.Line === caret.End.Line)
                return false;
            const lines = self.GetLines();
            unwrapRange(caret.Start.Node);
            for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
                const line = lines[index];
                const firstChild = DOM.Utils.GetFirstChild(line);
                if (!firstChild)
                    continue;
                unwrapRange(firstChild);
            }
            unwrapRange(caret.End.Node, true);
            return true;
        };
        const UnwrapFromCaret = (caret) => {
            if (formatUtils.LeaveProcessorIfFigure(self, caret))
                return;
            if (processSameLine(caret))
                return;
            processRange(caret);
        };
        return {
            UnwrapFromCaret
        };
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

    const Wrapper = (editor, format) => {
        const self = editor;
        const DOM = self.DOM;
        const formatter = self.Formatter;
        const formatUtils = formatter.Utils;
        const blockFormats = formatter.Formats.BlockFormatTags;
        const { Tag, Switchable, Following } = format;
        const tableAndListSelector = Join(',', ...[DOM.Element.Table.Selector, ...blockFormats.List]);
        const createListItem = (...nodes) => {
            const newListItem = DOM.Create(Following);
            DOM.CloneAndInsert(newListItem, true, ...nodes);
            return newListItem;
        };
        const wrapNoesInTableItem = (item) => {
            const newList = DOM.Create(Tag);
            Each(DOM.GetChildNodes(item, false), child => {
                if (DOM.Utils.IsBr(child))
                    return;
                if (Switchable.has(DOM.Utils.GetNodeName(child)))
                    return DOM.CloneAndInsert(newList, true, ...DOM.GetChildNodes(child, false));
                const newListItem = createListItem(child);
                DOM.Insert(newList, newListItem);
            });
            return newList;
        };
        const wrapNodesInTable = (selectedList) => Each(selectedList, selected => {
            const newList = wrapNoesInTableItem(selected);
            if (!DOM.Utils.HasChildNodes(newList))
                DOM.Insert(newList, DOM.Utils.WrapTagHTML(Following, '<br>'));
            selected.replaceChildren(newList);
        });
        const mergeList = (node, insertion) => {
            if (!!node.previousSibling && DOM.Utils.GetNodeName(node.previousSibling) === Tag) {
                DOM.Insert(node.previousSibling, ...(!!insertion ? [insertion] : DOM.GetChildNodes(node, false)));
                return DOM.Remove(node, true);
            }
            if (!node.nextSibling || DOM.Utils.GetNodeName(node.nextSibling) !== Tag)
                return;
            const firstChild = DOM.Utils.GetFirstChild(node.nextSibling);
            const bFirstChild = !!firstChild;
            const insert = bFirstChild ? DOM.InsertBefore : DOM.Insert;
            const selector = bFirstChild ? firstChild : node.nextSibling;
            insert(selector, ...(!!insertion ? [insertion] : DOM.GetChildNodes(node, false)));
            DOM.Remove(node, true);
        };
        const switchFormat = (node) => {
            if (!node.parentNode || !Switchable.has(DOM.Utils.GetNodeName(node)))
                return;
            const newList = DOM.Create(Tag);
            DOM.CloneAndInsert(newList, true, ...DOM.GetChildNodes(node, false));
            node.parentNode.replaceChild(newList, node);
            mergeList(newList);
        };
        const wrapBlock = (node) => {
            if (!node.parentNode)
                return;
            const newListItem = createListItem(...DOM.GetChildNodes(node, false));
            if (node.previousSibling && DOM.Utils.GetNodeName(node.previousSibling) === Tag) {
                DOM.Insert(node.previousSibling, ...[newListItem]);
                return DOM.Remove(node, true);
            }
            if (node.nextSibling && DOM.Utils.GetNodeName(node.nextSibling) === Tag) {
                const firstChild = DOM.Utils.GetFirstChild(node.nextSibling);
                const bFirstChild = !!firstChild;
                const insert = bFirstChild ? DOM.InsertBefore : DOM.Insert;
                const selector = bFirstChild ? firstChild : node.nextSibling;
                insert(selector, ...[newListItem]);
                return DOM.Remove(node, true);
            }
            const newList = DOM.Create(Tag);
            DOM.Insert(newList, newListItem);
            node.parentNode.replaceChild(newList, node);
        };
        const wrapNodesInList = (oldList, startItem, endItem) => {
            var _a;
            if (DOM.Utils.GetNodeName(oldList) === Tag)
                return;
            const children = DOM.GetChildNodes(oldList);
            if (children[0] === startItem && children[children.length - 1] === endItem)
                return switchFormat(oldList);
            const originalListName = DOM.Utils.GetNodeName(oldList);
            const startList = DOM.Create(originalListName);
            const middleList = DOM.Create(Tag);
            const endList = DOM.Create(originalListName);
            let bMiddle = false;
            let bEnd = false;
            Each(children, child => {
                if (child === startItem)
                    bMiddle = true;
                const addable = bEnd ? endList : (bMiddle ? middleList : startList);
                DOM.CloneAndInsert(addable, true, child);
                if (child === endItem)
                    bEnd = true;
            });
            const bStartFromMiddle = !DOM.Utils.HasChildNodes(startList);
            (_a = oldList.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(bStartFromMiddle ? middleList : startList, oldList);
            if (!bStartFromMiddle)
                DOM.InsertAfter(startList, middleList);
            if (DOM.Utils.HasChildNodes(endList))
                DOM.InsertAfter(middleList, endList);
            mergeList(middleList);
        };
        const getBlock = (node) => {
            let current = node;
            while (current && current !== self.GetBody()) {
                if (current.parentNode === self.GetBody())
                    break;
                current = current.parentNode;
            }
            return current;
        };
        const wrapRange = (node, bFromFirst = false) => {
            if (!node)
                return;
            const target = formatUtils.GetParentIfText(node);
            if (!DOM.Closest(target, tableAndListSelector)) {
                const blockNode = getBlock(target);
                if (!blockNode)
                    return;
                return wrapBlock(blockNode);
            }
            const table = DOM.Element.Table.FindClosest(target);
            if (!!table)
                return;
            const follower = DOM.Closest(target, Following);
            if (!(follower === null || follower === void 0 ? void 0 : follower.parentNode))
                return;
            const oldList = follower.parentNode;
            const children = DOM.GetChildNodes(oldList);
            const startItem = !bFromFirst ? follower : children[0];
            const endItem = !bFromFirst ? children[children.length - 1] : follower;
            wrapNodesInList(oldList, startItem, endItem);
        };
        const wrapNodesInSameLine = (root, node, bFromFirst = false) => {
            if (!root)
                return;
            if (!Switchable.has(DOM.Utils.GetNodeName(root)))
                return wrapBlock(root);
            const children = DOM.GetChildNodes(root, false);
            if (!node)
                return wrapNodesInList(root, children[0], children[children.length - 1]);
            let item;
            Each(children, child => {
                if (!DOM.Utils.IsChildOf(node, child))
                    return;
                item = child;
            });
            if (!item)
                return;
            wrapNodesInList(root, !bFromFirst ? item : children[0], !bFromFirst ? children[children.length - 1] : item);
        };
        const wrapNodesInTableCell = (root, startNode, endNode) => {
            const rootChildren = DOM.GetChildNodes(root, true);
            let bStart = false;
            const wrapBlockBeforeWrapList = (node) => {
                var _a;
                const paragraph = DOM.Create('p');
                DOM.CloneAndInsert(paragraph, true, node);
                (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(paragraph, node);
                return paragraph;
            };
            const wrapNodeInTableCell = (child, marker, bPrevious) => {
                if (DOM.Utils.IsBr(child))
                    return DOM.Remove(child);
                const bChildText = IsText(child);
                const node = bChildText ? wrapBlockBeforeWrapList(child) : child;
                if (bChildText && marker) {
                    const insert = bPrevious ? DOM.InsertBefore : DOM.InsertAfter;
                    insert(node.firstChild, marker);
                }
                wrapNodesInSameLine(node);
            };
            Each(rootChildren, (child, exit) => {
                if (DOM.Utils.IsChildOf(startNode, child)) {
                    bStart = true;
                    const marker = DOM.HasAttr(child.previousSibling, 'marker') ? child.previousSibling : null;
                    return wrapNodeInTableCell(child, marker, true);
                }
                if (DOM.Utils.IsChildOf(endNode, child)) {
                    const marker = DOM.HasAttr(child.nextSibling, 'marker') ? child.nextSibling : null;
                    wrapNodeInTableCell(child, marker);
                    return exit();
                }
                if (bStart)
                    wrapNodeInTableCell(child);
            });
        };
        const processSameLine = (caret) => {
            if (caret.Start.Line !== caret.End.Line)
                return false;
            const startNode = formatUtils.GetParentIfText(caret.Start.Node);
            const endNode = formatUtils.GetParentIfText(caret.End.Node);
            if (!DOM.Closest(startNode, tableAndListSelector)) {
                const blockNode = getBlock(startNode);
                if (!blockNode)
                    return false;
                wrapBlock(blockNode);
                return true;
            }
            const table = DOM.Element.Table.FindClosest(startNode);
            if (!!table) {
                const selectedTableItems = DOM.Element.Table.GetSelectedCells(self, table);
                if (!IsEmpty(selectedTableItems)) {
                    wrapNodesInTable(selectedTableItems);
                    return true;
                }
            }
            const startListItem = DOM.Closest(startNode, Following);
            const endListItem = DOM.Closest(endNode, Following);
            if ((startListItem === null || startListItem === void 0 ? void 0 : startListItem.parentNode) && (endListItem === null || endListItem === void 0 ? void 0 : endListItem.parentNode) && startListItem.parentNode === endListItem.parentNode) {
                wrapNodesInList(startListItem.parentNode, startListItem, endListItem);
                return true;
            }
            if ((startListItem || endListItem)) {
                const rootChildren = DOM.GetChildNodes(caret.SameRoot);
                let bStart = false;
                Each(rootChildren, (child, exit) => {
                    if (DOM.Utils.IsChildOf(caret.Start.Node, child)) {
                        bStart = true;
                        return wrapNodesInSameLine(child, caret.Start.Node);
                    }
                    if (DOM.Utils.IsChildOf(caret.End.Node, child)) {
                        wrapNodesInSameLine(child, caret.End.Node, true);
                        return exit();
                    }
                    if (bStart)
                        wrapNodesInSameLine(child);
                });
                if (bStart)
                    return true;
            }
            const bRootTableCell = DOM.Element.Table.FindClosestCell(startNode) === DOM.Element.Table.FindClosestCell(endNode);
            if (!bRootTableCell)
                return true;
            wrapNodesInTableCell(caret.SameRoot, caret.Start.Node, caret.End.Node);
            return true;
        };
        const processRange = (caret) => {
            if (caret.Start.Line === caret.End.Line)
                return false;
            const lines = self.GetLines();
            wrapRange(caret.Start.Node);
            for (let index = caret.Start.Line + 1; index < caret.End.Line; ++index) {
                const line = lines[index];
                const firstChild = DOM.Utils.GetFirstChild(line);
                if (!firstChild)
                    continue;
                wrapRange(firstChild);
            }
            wrapRange(caret.End.Node, true);
            return true;
        };
        const WrapFromCaret = (caret) => {
            if (formatUtils.LeaveProcessorIfFigure(self, caret))
                return;
            if (processSameLine(caret))
                return;
            processRange(caret);
        };
        return {
            WrapFromCaret
        };
    };

    const Toggler = (editor, format) => {
        const self = editor;
        const CaretUtils = self.Utils.Caret;
        const formatUtils = self.Formatter.Utils;
        const wrapper = Wrapper(self, format);
        const unwrapper = Unwrapper(self, format);
        const ToggleFromCaret = (bWrap) => {
            const toggle = bWrap ? wrapper.WrapFromCaret : unwrapper.UnwrapFromCaret;
            const caret = CaretUtils.Get();
            if (!caret)
                return;
            formatUtils.RunFormatting(self, () => toggle(caret));
        };
        return {
            ToggleFromCaret
        };
    };

    const UI = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const formats = self.Formatter.Formats;
        const formatUI = self.Formatter.UI;
        const Detector = self.Formatter.Detector;
        const IsDetected = (tagName, nodes) => {
            for (let index = 0, length = nodes.length; index < length; ++index) {
                const node = nodes[index];
                if (!DOM.Closest(node, tagName))
                    continue;
                return true;
            }
            return false;
        };
        const createCommand = (format, button) => (bActive) => {
            if (formatUI.IsDisabled(button))
                return;
            const toggler = Toggler(self, format);
            toggler.ToggleFromCaret(bActive);
            formatUI.ToggleActivateClass(button, bActive);
            self.Utils.Shared.DispatchCaretChange();
        };
        const CreateIconButton = (uiName, uiFormat) => {
            const { Format, Title, Icon } = uiFormat;
            const button = formatUI.CreateIconButton(Title, Icon);
            const command = createCommand(Format, button);
            formatUI.RegisterCommand(self, uiName, command);
            formatUI.BindClickEvent(button, () => formatUI.RunCommand(self, uiName, !formatUI.HasActiveClass(button)));
            return button;
        };
        const RegisterDetector = (button, format) => Detector.Register((paths) => {
            formatUI.ToggleActivateClass(button, IsDetected(format.Tag, paths));
            const { Figure, FigureElement } = DOM.Element.Figure.Find(paths[0]);
            const bDisable = !!Figure && !!FigureElement && formats.AllDisableList.has(DOM.Utils.GetNodeName(FigureElement));
            formatUI.ToggleDisable(button, bDisable);
        });
        return {
            IsDetected,
            CreateIconButton,
            RegisterDetector,
        };
    };

    const BulletList = (editor, ui) => {
        const self = editor;
        const blockFormats = self.Formatter.Formats.BlockFormatTags;
        const listSelector = self.Formatter.Formats.ListItemSelector;
        const uiName = 'BulletList';
        const uiFormat = {
            Format: { Tag: 'ul', Switchable: blockFormats.List, Following: listSelector, UnsetSwitcher: 'p' },
            Title: self.Lang('plugins.lists.bullet', 'Bulleted List'),
            Icon: 'UnorderedList'
        };
        const button = ui.CreateIconButton(uiName, uiFormat);
        ui.RegisterDetector(button, uiFormat.Format);
        self.Toolbar.Add(uiName, button);
    };

    const NumberList = (editor, ui) => {
        const self = editor;
        const blockFormats = self.Formatter.Formats.BlockFormatTags;
        const listSelector = self.Formatter.Formats.ListItemSelector;
        const uiName = 'NumberList';
        const uiFormat = {
            Format: { Tag: 'ol', Switchable: blockFormats.List, Following: listSelector, UnsetSwitcher: 'p' },
            Title: self.Lang('plugins.lists.number', 'Numbered List'),
            Icon: 'OrderedList'
        };
        const button = ui.CreateIconButton(uiName, uiFormat);
        ui.RegisterDetector(button, uiFormat.Format);
        self.Toolbar.Add(uiName, button);
    };

    const Setup = (editor) => {
        const self = editor;
        const pluginManager = self.Plugin;
        const formatUtils = self.Formatter.Utils;
        const ui = UI(self);
        const formatNames = ['BulletList', 'NumberList'];
        const createUi = (name) => {
            if (!formatUtils.HasFormatName(name, formatNames))
                return;
            const uiName = formatUtils.GetFormatName(name, formatNames);
            switch (uiName) {
                case formatNames[0]:
                    BulletList(self, ui);
                    break;
                case formatNames[1]:
                    NumberList(self, ui);
                    break;
            }
        };
        Each(formatNames, name => pluginManager.Add(name, createUi));
    };

    var Plugin = () => RichEditor.Loaders.Plugin.Add('lists', (editor) => Setup(editor));

    Plugin();

})();
