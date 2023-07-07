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
    const IsObject = isType('object');
    const IsString = isType('string');
    const IsBoolean = isType('boolean');
    const IsFunction = isType('function');

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
    const Clean = (array) => array.splice(0, array.length);
    const Convert = (array) => Array.from(array);

    const Entries = (obj, callback) => {
        if (!IsObject(obj))
            return [];
        const entries = Object.entries(obj);
        if (!IsFunction(callback))
            return entries;
        const length = entries.length;
        for (let index = 0; index < length; ++index) {
            const entry = entries[index];
            callback(entry[0], entry[1], () => { index = length; });
        }
        return entries;
    };
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

    const IsEmpty = (value) => IsString(value) && value.length === 0;
    const LowerCase = (value) => value.toString().toLowerCase();
    const UpperCase = (value) => value.toString().toUpperCase();
    const Contains = (value, expect) => IsString(expect) ? value.includes(expect) : expect.test(value);
    const Join = (attacher, ...args) => args.join(attacher);
    const Merge = (...args) => Join('', ...args);

    const TableFormat = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const CaretUtils = self.Utils.Caret;
        const formatter = self.Formatter;
        const CreateFromCaret = (rowNum, cellNum) => {
            var _a;
            const figure = DOM.Element.Figure.Create(DOM.Element.Table.Selector);
            const table = DOM.Create(DOM.Element.Table.Selector, {
                attrs: {
                    border: '1',
                    contenteditable: 'true',
                },
            });
            const parts = self.Tools.Parts.Create('table', table);
            let firstCellParagraph = table;
            for (let rowIndex = 0; rowIndex <= rowNum; ++rowIndex) {
                const tr = DOM.Create(DOM.Element.Table.RowSelector);
                for (let cellIndex = 0; cellIndex <= cellNum; ++cellIndex) {
                    const paragraph = self.CreateEmptyParagraph();
                    const cell = DOM.Create('td', {
                        children: [paragraph]
                    });
                    if (rowIndex === 0 && cellIndex === 0)
                        firstCellParagraph = paragraph;
                    DOM.Insert(tr, cell);
                }
                DOM.Insert(table, tr);
            }
            DOM.Insert(figure, table, parts);
            self.Focus();
            self.Tools.Parts.UnsetAllFocused();
            const caret = CaretUtils.Get();
            const lines = self.GetLines();
            const finish = () => {
                const newRange = self.Utils.Range();
                newRange.SetStartToEnd(firstCellParagraph, 1, 1);
                CaretUtils.UpdateRange(newRange);
                self.Utils.Shared.DispatchCaretChange([firstCellParagraph]);
            };
            if (!caret) {
                const insert = IsEmpty$1(lines) ? DOM.Insert : DOM.InsertAfter;
                const target = IsEmpty$1(lines) ? self.GetBody() : lines[0];
                insert(target, figure);
                return finish();
            }
            self.Utils.Shared.DeleteRange(caret);
            const { StartBlock, EndBlock } = self.Utils.Shared.SplitLines(caret.Start.Node, caret.Start.Offset);
            const node = formatter.Utils.GetParentIfText(caret.Start.Node);
            const blockNode = (_a = StartBlock !== null && StartBlock !== void 0 ? StartBlock : DOM.Closest(node, { tagName: Convert(formatter.Formats.BlockFormatTags.Block) })) !== null && _a !== void 0 ? _a : lines[0];
            const insert = !blockNode ? DOM.Insert : DOM.InsertAfter;
            const insertions = !blockNode ? [figure, EndBlock] : [EndBlock, figure];
            insert(blockNode !== null && blockNode !== void 0 ? blockNode : self.GetBody(), ...insertions);
            if (!DOM.Element.Figure.Is(StartBlock) && IsEmpty(DOM.GetText(StartBlock)))
                DOM.Remove(StartBlock);
            if (!DOM.Element.Figure.Is(EndBlock) && IsEmpty(DOM.GetText(EndBlock)))
                DOM.Remove(EndBlock);
            finish();
        };
        return {
            CreateFromCaret,
        };
    };

    const createCommandName = (name) => Join(':', 'Table', name);
    const createStyleCommandName = (name) => Join(':', 'TableStyle', name);
    const createRowCommandName = (name) => createCommandName(Join(':', 'Row', name));
    const createColumnCommandName = (name) => createCommandName(Join(':', 'Column', name));
    const COMMAND_NAMES_MAP = {
        TABLE_CREATE: createCommandName('Create'),
        TABLE_REMOVE: createCommandName('Remove'),
        FLOAT_LEFT: createStyleCommandName('FloatLeft'),
        FLOAT_RIGHT: createStyleCommandName('FloatRight'),
        ALIGN_LEFT: createStyleCommandName('AlignLeft'),
        ALIGN_CENTER: createStyleCommandName('AlignCenter'),
        ALIGN_RIGHT: createStyleCommandName('AlignRight'),
        ROW: {
            INSERT: createRowCommandName('Insert'),
            SELECT: createRowCommandName('Select'),
            DELETE: createRowCommandName('Delete'),
        },
        COLUMN: {
            INSERT: createColumnCommandName('Insert'),
            SELECT: createColumnCommandName('Select'),
            DELETE: createColumnCommandName('Delete'),
        }
    };
    const STYLE_COMMANDS = [
        { Name: COMMAND_NAMES_MAP.FLOAT_LEFT, Styles: { float: 'left' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
        { Name: COMMAND_NAMES_MAP.FLOAT_RIGHT, Styles: { float: 'right' }, SameStyles: ['margin-left', 'margin-right'], bAsText: true },
        { Name: COMMAND_NAMES_MAP.ALIGN_LEFT, Styles: { marginLeft: '0px', marginRight: 'auto' }, SameStyles: ['float'] },
        { Name: COMMAND_NAMES_MAP.ALIGN_CENTER, Styles: { marginLeft: 'auto', marginRight: 'auto' }, SameStyles: ['float'] },
        { Name: COMMAND_NAMES_MAP.ALIGN_RIGHT, Styles: { marginLeft: 'auto', marginRight: '0px' }, SameStyles: ['float'] },
    ];
    const GetMenuText = (editor, name, defaultText) => editor.Lang(Merge('plugins.parts.menu.', name), defaultText);
    const CanDeleteRowColumn = (editor, type, table) => {
        const self = editor;
        const DOM = self.DOM;
        const selectedCells = DOM.Element.Table.GetSelectedCells(self, table);
        if (IsEmpty$1(selectedCells)) {
            if (type === 'row')
                return DOM.Element.Table.GetAllOwnRows(table).length > 1;
            const { Grid } = DOM.Element.Table.GetGridWithIndex(table);
            for (let index = 0, length = Grid.length; index < length; ++index) {
                if (Grid[index].length !== 1)
                    continue;
                return false;
            }
            return true;
        }
        const { Grid, TargetCellRowIndex, TargetCellIndex } = DOM.Element.Table.GetGridWithIndex(table, selectedCells[0]);
        if (TargetCellRowIndex === -1 || TargetCellIndex === -1)
            return false;
        if (type === 'row') {
            if (TargetCellRowIndex > 0)
                return true;
            const rows = [];
            WhileShift(selectedCells, cell => {
                const row = DOM.Element.Table.FindClosestRow(cell);
                if (!row || Contains$1(rows, row))
                    return;
                Push(rows, row);
            });
            return IsEmpty$1(rows) ? false : Grid.length !== rows.length;
        }
        if (TargetCellIndex > 0)
            return true;
        for (let columnIndex = TargetCellIndex, columnLength = Grid[TargetCellRowIndex].length; columnIndex < columnLength; ++columnIndex) {
            if (!Contains$1(selectedCells, Grid[TargetCellRowIndex][columnIndex]))
                return true;
        }
        return false;
    };

    const TableColumn = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const CaretUtils = self.Utils.Caret;
        const getColumnsWithGrid = (pointer) => {
            const columns = [];
            if (!IsArray(pointer)) {
                const { Table, Cell } = DOM.Element.Table.Find(self.Formatter.Utils.GetParentIfText(pointer.Start.Node));
                if (!Table || !Cell)
                    return {};
                const tableGrid = DOM.Element.Table.GetGridWithIndex(Table, Cell);
                const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
                if (TargetCellRowIndex === -1 || TargetCellIndex === -1)
                    return {};
                Each(Grid, row => {
                    if (!row[TargetCellIndex])
                        return;
                    Push(columns, row[TargetCellIndex]);
                });
                return {
                    columns,
                    table: Table,
                    tableGrid,
                };
            }
            if (IsEmpty$1(pointer))
                return {};
            const table = DOM.Element.Table.FindClosest(pointer[0]);
            if (!table)
                return {};
            const tableGrid = DOM.Element.Table.GetGridWithIndex(table, pointer[0]);
            const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
            if (TargetCellRowIndex === -1 || TargetCellIndex === -1 || !Grid[TargetCellRowIndex])
                return {};
            const columnIndexes = [TargetCellIndex];
            for (let index = TargetCellIndex + 1, length = Grid[TargetCellRowIndex].length; index < length; ++index) {
                if (!Contains$1(pointer, Grid[TargetCellRowIndex][index]))
                    break;
                Push(columnIndexes, index);
            }
            Each(Grid, row => Each(columnIndexes, columnIndex => {
                if (!row[columnIndex])
                    return;
                Push(columns, row[columnIndex]);
            }));
            Clean(columnIndexes);
            return {
                columns,
                table,
                tableGrid,
            };
        };
        const InsertFromCaret = (bLeft) => {
            const caret = CaretUtils.Get();
            const { columns, table, tableGrid } = getColumnsWithGrid(caret !== null && caret !== void 0 ? caret : DOM.Element.Table.GetSelectedCells(self));
            if (!columns || IsEmpty$1(columns) || !tableGrid || !table || !CanDeleteRowColumn(self, 'column', table))
                return;
            const copiedRange = caret === null || caret === void 0 ? void 0 : caret.Range.Clone();
            const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
            let columnIndex = TargetCellIndex;
            if (!bLeft && !caret) {
                for (let index = TargetCellIndex, length = Grid[TargetCellRowIndex].length; index < length; ++index) {
                    const nextColumn = Grid[TargetCellRowIndex][index].nextElementSibling;
                    if (!nextColumn || !Contains$1(columns, nextColumn)) {
                        columnIndex = index;
                        break;
                    }
                }
            }
            const addedColumns = [];
            Each(Grid, row => {
                const column = row[columnIndex];
                if (!column)
                    return;
                const sibling = bLeft ? column.previousElementSibling : column.nextElementSibling;
                if (Contains$1(addedColumns, sibling))
                    return;
                const newColumn = DOM.Create('td', {
                    children: [self.CreateEmptyParagraph()]
                });
                const insert = bLeft ? DOM.InsertBefore : DOM.InsertAfter;
                insert(column, newColumn);
                Push(addedColumns, newColumn);
            });
            Clean(addedColumns);
            if (caret && copiedRange)
                CaretUtils.UpdateRange(copiedRange);
            self.Utils.Shared.DispatchCaretChange();
        };
        const SelectFromCaret = () => {
            var _a;
            const { columns } = getColumnsWithGrid((_a = CaretUtils.Get()) !== null && _a !== void 0 ? _a : DOM.Element.Table.GetSelectedCells(self));
            if (!columns || IsEmpty$1(columns))
                return;
            DOM.Element.Table.ToggleSelectMultipleCells(true, columns);
            Clean(columns);
            CaretUtils.CleanRanges();
            self.Utils.Shared.DispatchCaretChange();
        };
        const DeleteFromCaret = () => {
            var _a, _b;
            const { columns, table, tableGrid } = getColumnsWithGrid((_a = CaretUtils.Get()) !== null && _a !== void 0 ? _a : DOM.Element.Table.GetSelectedCells(self));
            if (!columns || IsEmpty$1(columns) || !tableGrid || !table || !CanDeleteRowColumn(self, 'column', table))
                return;
            const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
            let futureCaretTarget = null;
            for (let index = TargetCellIndex, length = Grid[TargetCellRowIndex].length; index < length; ++index) {
                const nextColumn = Grid[TargetCellRowIndex][index].nextElementSibling;
                if (!nextColumn || !Contains$1(columns, nextColumn)) {
                    futureCaretTarget = nextColumn;
                    break;
                }
            }
            futureCaretTarget = futureCaretTarget !== null && futureCaretTarget !== void 0 ? futureCaretTarget : Grid[TargetCellRowIndex][TargetCellIndex].previousElementSibling;
            WhileShift(columns, column => DOM.Remove(column, true));
            futureCaretTarget = (_b = futureCaretTarget !== null && futureCaretTarget !== void 0 ? futureCaretTarget : DOM.Element.Table.GetAllOwnCells(table)[0]) !== null && _b !== void 0 ? _b : null;
            const firstChild = DOM.Utils.GetFirstChild(futureCaretTarget, true);
            const newRange = self.Utils.Range();
            newRange.SetStartToEnd(firstChild, 0, 0);
            CaretUtils.UpdateRange(newRange);
            self.Utils.Shared.DispatchCaretChange();
        };
        return {
            InsertFromCaret,
            SelectFromCaret,
            DeleteFromCaret,
        };
    };

    const TableRow = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const CaretUtils = self.Utils.Caret;
        const getRows = (pointer) => {
            if (!IsArray(pointer)) {
                const row = DOM.Element.Table.FindClosestRow(self.Formatter.Utils.GetParentIfText(pointer.Start.Node));
                return !row ? null : [row];
            }
            if (IsEmpty$1(pointer))
                return null;
            const rows = [];
            Each(pointer, cell => {
                const row = DOM.Element.Table.FindClosestRow(cell);
                if (!row || Contains$1(rows, row))
                    return;
                Push(rows, row);
            });
            return rows;
        };
        const getRowsWithGrid = (pointer) => {
            const rows = [];
            if (!IsArray(pointer)) {
                const { Table, Row, Cell } = DOM.Element.Table.Find(self.Formatter.Utils.GetParentIfText(pointer.Start.Node));
                if (!Table || !Row || !Cell)
                    return {};
                const tableGrid = DOM.Element.Table.GetGridWithIndex(Table, Cell);
                if (tableGrid.TargetCellRowIndex === -1 || tableGrid.TargetCellIndex === -1)
                    return {};
                Push(rows, Row);
                return {
                    rows,
                    table: Table,
                    tableGrid
                };
            }
            if (IsEmpty$1(pointer))
                return {};
            const table = DOM.Element.Table.FindClosest(pointer[0]);
            if (!table)
                return {};
            const tableGrid = DOM.Element.Table.GetGridWithIndex(table, pointer[0]);
            if (tableGrid.TargetCellRowIndex === -1 || tableGrid.TargetCellIndex === -1)
                return {};
            Each(pointer, cell => {
                const row = DOM.Element.Table.FindClosestRow(cell);
                if (!row || Contains$1(rows, row))
                    return;
                Push(rows, row);
            });
            return {
                rows,
                table,
                tableGrid,
            };
        };
        const InsertFromCaret = (bAbove) => {
            var _a;
            const caret = CaretUtils.Get();
            const { rows, table, tableGrid } = getRowsWithGrid(caret !== null && caret !== void 0 ? caret : DOM.Element.Table.GetSelectedCells(self));
            if (!rows || IsEmpty$1(rows) || !tableGrid || !table || !CanDeleteRowColumn(self, 'row', table))
                return;
            const copiedRange = caret === null || caret === void 0 ? void 0 : caret.Range.Clone();
            const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
            let targetRow = DOM.Element.Table.FindClosestRow(Grid[TargetCellRowIndex][TargetCellIndex]);
            if (!bAbove && !caret) {
                for (let index = TargetCellRowIndex, length = Grid.length; index < length; ++index) {
                    const cell = (_a = Grid[index][TargetCellIndex]) !== null && _a !== void 0 ? _a : null;
                    const row = DOM.Element.Table.FindClosestRow(cell);
                    if (!row || !Contains$1(rows, row) || index === length - 1) {
                        targetRow = row;
                        break;
                    }
                }
            }
            const insert = bAbove ? DOM.InsertBefore : DOM.InsertAfter;
            const newRow = DOM.Create(DOM.Element.Table.RowSelector);
            for (let index = 0, length = Grid[0].length; index < length; ++index) {
                const newColumn = DOM.Create('td', {
                    children: [self.CreateEmptyParagraph()]
                });
                DOM.Insert(newRow, newColumn);
            }
            insert(targetRow, newRow);
            if (caret && copiedRange)
                CaretUtils.UpdateRange(copiedRange);
            self.Utils.Shared.DispatchCaretChange();
        };
        const SelectFromCaret = () => {
            var _a;
            const rows = getRows((_a = CaretUtils.Get()) !== null && _a !== void 0 ? _a : DOM.Element.Table.GetSelectedCells(self));
            if (!rows || IsEmpty$1(rows))
                return;
            WhileShift(rows, row => DOM.Element.Table.ToggleSelectMultipleCells(true, DOM.Element.Table.GetAllOwnCells(row)));
            CaretUtils.CleanRanges();
            self.Utils.Shared.DispatchCaretChange();
        };
        const DeleteFromCaret = () => {
            var _a, _b, _c, _d;
            const { rows, table, tableGrid } = getRowsWithGrid((_a = CaretUtils.Get()) !== null && _a !== void 0 ? _a : DOM.Element.Table.GetSelectedCells(self));
            if (!rows || IsEmpty$1(rows) || !tableGrid || !table || !CanDeleteRowColumn(self, 'row', table))
                return;
            const { Grid, TargetCellRowIndex, TargetCellIndex } = tableGrid;
            let futureCaretTarget = null;
            for (let index = TargetCellRowIndex, length = Grid.length; index < length; ++index) {
                const cell = (_b = Grid[index][TargetCellIndex]) !== null && _b !== void 0 ? _b : null;
                const row = DOM.Element.Table.FindClosestRow(cell);
                if (!row || !Contains$1(rows, row)) {
                    futureCaretTarget = cell;
                    break;
                }
            }
            futureCaretTarget = (_c = futureCaretTarget !== null && futureCaretTarget !== void 0 ? futureCaretTarget : Grid[TargetCellRowIndex - 1][TargetCellIndex]) !== null && _c !== void 0 ? _c : null;
            WhileShift(rows, row => DOM.Remove(row, true));
            futureCaretTarget = (_d = futureCaretTarget !== null && futureCaretTarget !== void 0 ? futureCaretTarget : DOM.Element.Table.GetAllOwnCells(table)[0]) !== null && _d !== void 0 ? _d : null;
            const firstChild = DOM.Utils.GetFirstChild(futureCaretTarget, true);
            const newRange = self.Utils.Range();
            newRange.SetStartToEnd(firstChild, 0, 0);
            CaretUtils.UpdateRange(newRange);
            self.Utils.Shared.DispatchCaretChange();
        };
        return {
            InsertFromCaret,
            SelectFromCaret,
            DeleteFromCaret,
        };
    };

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

    const TableStyles = (editor, format) => {
        const self = editor;
        const DOM = self.DOM;
        const { Styles, SameStyles, bAsText } = format;
        const wrapStyle = (table) => {
            const figure = DOM.Element.Figure.FindClosest(table);
            if (!figure)
                return;
            DOM.RemoveStyles(figure, ...SameStyles);
            const toggleAttr = bAsText ? DOM.SetAttr : DOM.RemoveAttr;
            toggleAttr(figure, Options$1.ATTRIBUTES.AS_TEXT);
            DOM.SetStyles(figure, Styles);
        };
        const unwrapStyle = (table) => {
            const figure = DOM.Element.Figure.FindClosest(table);
            if (!figure)
                return;
            if (bAsText)
                DOM.RemoveAttr(figure, Options$1.ATTRIBUTES.AS_TEXT);
            DOM.RemoveStyles(figure, ...Keys(Styles));
        };
        const Toggle = (bWrap, table) => {
            const caret = self.Utils.Caret.Get();
            const cells = DOM.Element.Table.GetSelectedCells(self);
            const toggle = bWrap ? wrapStyle : unwrapStyle;
            toggle(table);
            if (!caret) {
                if (IsEmpty$1(cells))
                    return;
                self.Utils.Caret.CleanRanges();
                DOM.Element.Table.ToggleSelectMultipleCells(true, cells);
                return self.Utils.Shared.DispatchCaretChange();
            }
            self.Utils.Caret.UpdateRange(caret.Range.Clone());
            self.Utils.Shared.DispatchCaretChange();
        };
        return {
            Toggle,
        };
    };

    const RegisterCommands = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const createCommand = (row, cell) => {
            const tableFormat = TableFormat(self);
            tableFormat.CreateFromCaret(row, cell);
        };
        const createRemoveCommand = (node) => DOM.Element.Figure.Remove(self, node);
        const createStyleCommand = (format) => (bActive, node) => {
            const { FigureElement } = DOM.Element.Figure.Find(node);
            if (!FigureElement)
                return null;
            const toggler = TableStyles(self, format);
            toggler.Toggle(bActive, FigureElement);
        };
        const createRowColumnCommand = (type, key) => {
            const formatterCreator = type === 'row' ? TableRow : TableColumn;
            const formatter = formatterCreator(self);
            return (bAboveOrLeft) => {
                switch (key) {
                    case 'INSERT':
                        return formatter.InsertFromCaret(bAboveOrLeft);
                    case 'SELECT':
                        return formatter.SelectFromCaret();
                    case 'DELETE':
                        return formatter.DeleteFromCaret();
                }
            };
        };
        self.Commander.Register(COMMAND_NAMES_MAP.TABLE_CREATE, createCommand);
        self.Commander.Register(COMMAND_NAMES_MAP.TABLE_REMOVE, createRemoveCommand);
        Each(STYLE_COMMANDS, command => self.Commander.Register(command.Name, createStyleCommand(command)));
        Entries(COMMAND_NAMES_MAP.ROW, (key, name) => self.Commander.Register(name, createRowColumnCommand('row', key)));
        Entries(COMMAND_NAMES_MAP.COLUMN, (key, name) => self.Commander.Register(name, createRowColumnCommand('column', key)));
    };

    const Table = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const formatter = self.Formatter;
        const formatUI = formatter.UI;
        const uiName = 'Table';
        const uiFormat = {
            Format: { Tag: DOM.Element.Table.Selector },
            Title: self.Lang('plugins.table.title', 'Create a table'),
            Icon: 'Table'
        };
        const numRows = 10;
        const numCells = 10;
        const setNavigationText = (navigation, row, cell, add = 1) => DOM.SetHTML(navigation, `${row + add} × ${cell + add}`);
        const bindCellMouseEnterEvent = (navigation, cellItem, row, cell) => DOM.On(cellItem, RichEditor.NativeEventMap.mouseenter, () => {
            var _a, _b;
            if (!((_a = cellItem.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement))
                return;
            for (let rowIndex = 0; rowIndex < numCells; ++rowIndex) {
                const itemRowToHover = DOM.Select({
                    attrs: {
                        row: rowIndex.toString()
                    }
                }, (_b = cellItem.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement);
                const cells = DOM.GetChildren(itemRowToHover, false);
                for (let cellIndex = 0; cellIndex < numCells; ++cellIndex) {
                    const bHovered = rowIndex <= row && cellIndex <= cell;
                    const toggle = bHovered ? DOM.AddClass : DOM.RemoveClass;
                    toggle(cells[cellIndex], 'hover');
                }
            }
            setNavigationText(navigation, row, cell);
        });
        const removeAllHovered = (navigation, parent) => () => {
            Each(DOM.SelectAll('.hover', parent), hovered => DOM.RemoveClass(hovered, 'hover'));
            setNavigationText(navigation, 1, 1, 0);
        };
        const createRowsAndCells = (navigation) => {
            const items = [];
            for (let row = 0; row < numRows; ++row) {
                const rowItem = formatUI.CreateItemGroup();
                DOM.SetAttr(rowItem, 'row', row.toString());
                for (let cell = 0; cell < numCells; ++cell) {
                    const cellItem = formatUI.Create({
                        tagName: formatter.Formats.ListItemSelector,
                        type: 'option-item',
                    });
                    DOM.SetAttr(cellItem, 'cell', cell.toString());
                    DOM.Insert(rowItem, cellItem);
                    bindCellMouseEnterEvent(navigation, cellItem, row, cell);
                    const upEvent = () => self.Commander.Run(COMMAND_NAMES_MAP.TABLE_CREATE, row, cell);
                    DOM.On(cellItem, RichEditor.NativeEventMap.mouseup, upEvent);
                    DOM.On(cellItem, RichEditor.NativeEventMap.touchend, upEvent);
                }
                Push(items, rowItem);
            }
            return items;
        };
        const createOptionList = (wrapper) => () => {
            const navigationWrapper = formatUI.Create({
                tagName: formatter.Formats.ListItemSelector,
                type: 'option-item',
            });
            const navigation = DOM.Create('div');
            setNavigationText(navigation, 1, 1, 0);
            DOM.Insert(navigationWrapper, navigation);
            DOM.On(navigationWrapper, RichEditor.NativeEventMap.mouseover, removeAllHovered(navigation, navigationWrapper.parentElement));
            const items = createRowsAndCells(navigation);
            Push(items, navigationWrapper);
            const tableList = formatUI.CreateOptionList(uiName, items);
            DOM.SetAttr(tableList, DOM.Element.Table.Selector, 'true');
            DOM.On(tableList, RichEditor.NativeEventMap.mouseleave, removeAllHovered(navigation, tableList));
            DOM.Insert(self.Frame.Root, tableList);
            formatUI.SetOptionListCoordinate(self, uiName, wrapper, tableList);
            return tableList;
        };
        const iconWrap = formatUI.CreateIconWrapSet(uiFormat.Title, uiFormat.Icon);
        DOM.SetAttr(iconWrap.Wrapper, 'no-border');
        formatUI.BindOptionListEvent(self, {
            type: uiName,
            activable: iconWrap.Wrapper,
            clickable: iconWrap.Wrapper,
            create: createOptionList(iconWrap.Wrapper)
        });
        self.Toolbar.Add(uiName, iconWrap.Wrapper);
    };

    const Alignment = (editor, table, tableMenu) => {
        const self = editor;
        const DOM = self.DOM;
        const detector = self.Formatter.Detector;
        const formatUI = self.Formatter.UI;
        const uiTitle = GetMenuText(self, 'table.alignment', 'Align a table');
        const uiType = 'TableAlignment';
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
        const findFormat = (element) => {
            if (!element)
                return uiFormats.Alignment[0];
            let foundFormat = null;
            const { Figure } = DOM.Element.Figure.Find(element);
            if (!Figure)
                return uiFormats.Alignment[0];
            Each(STYLE_COMMANDS, (format, exit) => {
                const { Name, Styles, bAsText } = format;
                if (bAsText && !DOM.HasAttr(Figure, Options$1.ATTRIBUTES.AS_TEXT))
                    return;
                let bSameFormat = null;
                Entries(Styles, (styleName, styleValue) => {
                    if (!IsBoolean(bSameFormat)) {
                        bSameFormat = DOM.HasStyle(Figure, styleName, styleValue);
                        return;
                    }
                    bSameFormat = bSameFormat && DOM.HasStyle(Figure, styleName, styleValue);
                });
                if (!bSameFormat)
                    return;
                Values(uiFormats, uiFormatList => Each(uiFormatList, (uiFormat, exitFinding) => {
                    if (uiFormat.CommandName !== Name)
                        return;
                    foundFormat = uiFormat;
                    exitFinding();
                }));
                exit();
            });
            return foundFormat !== null && foundFormat !== void 0 ? foundFormat : uiFormats.Alignment[0];
        };
        const createOptions = (options, formats, activeFormat) => {
            const icons = [];
            Each(formats, format => {
                const { Title, CommandName, Icon } = format;
                const button = formatUI.CreateIconButton(Title, Icon);
                if (activeFormat.CommandName === CommandName)
                    formatUI.ToggleActivateClass(button, true);
                formatUI.BindClickEvent(button, () => {
                    const bActive = !formatUI.HasActiveClass(button);
                    self.Commander.Run(CommandName, bActive, button);
                    const otherButtons = DOM.SelectAll({
                        class: DOM.Utils.CreateUEID('icon-button', false)
                    }, options);
                    Each(otherButtons, otherButton => formatUI.ToggleActivateClass(otherButton, false));
                    formatUI.ToggleActivateClass(button, bActive);
                });
                Push(icons, button);
            });
            return icons;
        };
        const createOptionList = (uiName, wrapper) => {
            const options = formatUI.CreateOptionList(uiName);
            DOM.SetAttr(options, 'icon-group', 'true');
            const foundFormat = findFormat(wrapper);
            Values(uiFormats, formats => {
                const group = DOM.Create('div', {
                    class: DOM.Utils.CreateUEID('icon-group', false)
                });
                DOM.Insert(group, ...createOptions(options, formats, foundFormat));
                DOM.Insert(options, group);
            });
            return options;
        };
        const group = DOM.Create('div', {
            class: DOM.Utils.CreateUEID('icon-group', false)
        });
        const firstFormat = findFormat(table);
        const { Wrapper, Button } = formatUI.CreateIconWrapSet(uiTitle, firstFormat.Icon);
        DOM.SetAttr(Button, Options$1.ATTRIBUTES.ICON, firstFormat.Icon);
        DOM.SetAttr(Wrapper, 'no-border');
        DOM.SetAttr(Wrapper, Options$1.ATTRIBUTES.TYPE, uiType);
        formatUI.BindOptionListEvent(self, {
            type: uiType,
            activable: Wrapper,
            clickable: Wrapper,
            create: () => {
                const optionList = createOptionList(uiType, Wrapper);
                DOM.Insert(tableMenu, optionList);
                formatUI.SetOptionListInToolsMenuCoordinate(self, Wrapper, optionList);
                return optionList;
            },
            root: tableMenu
        });
        detector.Register(() => {
            const foundFormat = findFormat(Wrapper);
            if (DOM.GetAttr(Button, Options$1.ATTRIBUTES.ICON) === foundFormat.Icon)
                return;
            DOM.SetAttr(Button, Options$1.ATTRIBUTES.ICON, foundFormat.Icon);
            DOM.SetHTML(Button, RichEditor.Icons.Get(foundFormat.Icon));
        });
        DOM.Insert(group, Wrapper);
        return group;
    };

    const RowColumn = (editor, table, tableMenu) => {
        const self = editor;
        const DOM = self.DOM;
        const formatUI = self.Formatter.UI;
        const uiFormats = {
            Row: {
                Type: 'TableRow',
                Title: GetMenuText(self, 'table.row', 'Table Row'),
                Icon: 'TableRow',
                Items: [
                    { Label: GetMenuText(self, 'table.row.insert.above', 'Insert row above'), CommandName: COMMAND_NAMES_MAP.ROW.INSERT, CommandArgs: [true] },
                    { Label: GetMenuText(self, 'table.row.insert.below', 'Insert row below'), CommandName: COMMAND_NAMES_MAP.ROW.INSERT, CommandArgs: [false] },
                    { Label: GetMenuText(self, 'table.row.select', 'Select row'), CommandName: COMMAND_NAMES_MAP.ROW.SELECT },
                    { Label: GetMenuText(self, 'table.row.delete', 'Delete row'), CommandName: COMMAND_NAMES_MAP.ROW.DELETE },
                ]
            },
            Column: {
                Type: 'TableColumn',
                Title: GetMenuText(self, 'table.column', 'Table Column'),
                Icon: 'TableColumn',
                Items: [
                    { Label: GetMenuText(self, 'table.column.insert.left', 'Insert column left'), CommandName: COMMAND_NAMES_MAP.COLUMN.INSERT, CommandArgs: [true] },
                    { Label: GetMenuText(self, 'table.column.insert.right', 'Insert column right'), CommandName: COMMAND_NAMES_MAP.COLUMN.INSERT, CommandArgs: [false] },
                    { Label: GetMenuText(self, 'table.column.select', 'Select column'), CommandName: COMMAND_NAMES_MAP.COLUMN.SELECT },
                    { Label: GetMenuText(self, 'table.column.delete', 'Delete column'), CommandName: COMMAND_NAMES_MAP.COLUMN.DELETE },
                ]
            },
        };
        const shouldDisable = (uiName, format) => {
            const { CommandName } = format;
            if (!Contains(LowerCase(CommandName), 'delete'))
                return false;
            const type = Contains(LowerCase(uiName), 'row') ? 'row' : 'column';
            return !CanDeleteRowColumn(self, type, table);
        };
        const createOptions = (uiName, formats) => {
            const items = [];
            Each(formats, format => {
                const { Label, CommandName, CommandArgs } = format;
                const item = formatUI.CreateOption(Label, Label, false, false);
                const bDisable = shouldDisable(uiName, format);
                formatUI.ToggleDisable(item, bDisable);
                if (!bDisable)
                    formatUI.BindClickEvent(item, () => {
                        formatUI.DestoryOpenedOptionList(self);
                        self.Commander.Run(CommandName, ...(CommandArgs !== null && CommandArgs !== void 0 ? CommandArgs : []));
                    });
                Push(items, item);
            });
            return items;
        };
        const createOptionList = (uiName, formats) => {
            const options = formatUI.CreateOptionList(uiName, createOptions(uiName, formats));
            return options;
        };
        const group = DOM.Create('div', {
            class: DOM.Utils.CreateUEID('icon-group', false)
        });
        Values(uiFormats, uiFormat => {
            const { Wrapper } = formatUI.CreateIconWrapSet(uiFormat.Title, uiFormat.Icon);
            DOM.SetAttrs(Wrapper, [
                'no-border',
                { dataType: uiFormat.Type }
            ]);
            formatUI.BindOptionListEvent(self, {
                type: uiFormat.Type,
                activable: Wrapper,
                clickable: Wrapper,
                create: () => {
                    const optionList = createOptionList(uiFormat.Type, uiFormat.Items);
                    DOM.Insert(tableMenu, optionList);
                    formatUI.SetOptionListInToolsMenuCoordinate(self, Wrapper, optionList);
                    return optionList;
                },
                root: tableMenu
            });
            DOM.Insert(group, Wrapper);
        });
        return group;
    };

    const TableMenu = (editor) => {
        const self = editor;
        const DOM = self.DOM;
        const formatUI = self.Formatter.UI;
        const createGroupWithoutFormat = (tableMenu) => {
            const group = DOM.Create('div', {
                class: DOM.Utils.CreateUEID('icon-group', false)
            });
            const button = formatUI.CreateIconButton(GetMenuText(self, 'remove.figure', 'Remove the figure'), 'Trash');
            DOM.SetAttr(button, Options$1.ATTRIBUTES.REMOVE);
            formatUI.BindClickEvent(button, () => self.Commander.Run(COMMAND_NAMES_MAP.TABLE_REMOVE, tableMenu));
            DOM.Insert(group, button);
            return group;
        };
        const Create = (e, table) => {
            const tableMenu = DOM.Create('div', {
                attrs: [Options$1.ATTRIBUTES.PARTS_MENU]
            });
            DOM.Insert(tableMenu, Alignment(self, table, tableMenu), RowColumn(self, table, tableMenu), createGroupWithoutFormat(tableMenu));
            return tableMenu;
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
        const formatNames = ['Table'];
        const parts = TableMenu(self);
        partsManager.Attach({
            name: 'table',
            partAttachers: [parts.Create],
        });
        const createUi = (name) => {
            if (!formatUtils.HasFormatName(name, formatNames))
                return;
            const uiName = formatUtils.GetFormatName(name, formatNames);
            switch (uiName) {
                case formatNames[0]:
                    RegisterCommands(self);
                    Table(self);
                    break;
            }
        };
        Each(formatNames, name => pluginManager.Add(name, createUi));
    };

    var Plugin = () => RichEditor.Loaders.Plugin.Add('table', (editor) => Setup(editor));

    Plugin();

})();
