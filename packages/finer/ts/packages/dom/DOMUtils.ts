import { NodeType } from '@dynafer/dom-control';
import { Arr, Obj, Str, Type, Utils } from '@dynafer/utils';
import Options, { EModeEditor } from '../../Options';

export const ESCAPE_EMPTY_TEXT_REGEX = /(%EF%BB%BF|%0A)/gi;
export const EMPTY_HEX_CODE = '&#xfeff;';

type TSelectorOptionCommon = string | Record<string, string> | (string | Record<string, string>)[];

export interface ICreateSelectorOption {
	tagName?: string | string[],
	id?: string,
	attrs?: TSelectorOptionCommon,
	class?: string | string[],
	styles?: TSelectorOptionCommon,
	bNot?: boolean,
	children?: ICreateSelectorOption,
}

export interface IDOMUtils {
	CreateUEID: (id?: string, bAddNum?: boolean) => string,
	GetModeTag: (mode: EModeEditor) => string,
	GetEmptyString: () => string,
	GetNodeName: (selector: Node | null) => string,
	IsParagraph: (selector: Node | null) => selector is HTMLParagraphElement,
	IsBr: (selector: Node | null) => selector is HTMLBRElement,
	IsImage: (selector: Node | null) => selector is HTMLImageElement,
	IsIFrame: (selector: Node | null) => selector is HTMLIFrameElement,
	IsVideo: (selector: Node | null) => selector is HTMLVideoElement,
	IsAnchor: (selector: Node | null) => selector is HTMLAnchorElement,
	CreateStyleVariable: (name: string, value: string) => string,
	WrapTagHTML: (tagName: string, text: string) => string,
	IsChildOf: (child: Node, parent: Node) => boolean,
	IsTextEmpty: (selector: Node | null) => boolean,
	HasChildNodes: (selector: Node | null) => boolean,
	CreateAttrSelector: (attr: string) => string,
	CreateAttrSelectorFromMap: (attrs: Record<string, string>) => string,
	CreateStyleSelector: (style: string) => string,
	CreateStyleSelectorFromMap: (styles: Record<string, string>) => string,
	CreateSelector: (opts: ICreateSelectorOption) => string,
	GetFirstChild: (node: Node | null, bDeep?: boolean) => Node | null,
	GetLastChild: (node: Node | null, bDeep?: boolean) => Node | null,
}

const DOMUtils = (): IDOMUtils => {
	const CreateUEID = (id: string = '', bAddNum: boolean = true): string =>
		Utils.CreateUEID(Str.IsEmpty(id) ? Options.PROJECT_NAME : `${Options.PROJECT_NAME}-${id}`, bAddNum);

	const GetModeTag = (mode: EModeEditor): string => {
		switch (mode) {
			case EModeEditor.inline:
				return 'div';
			case EModeEditor.classic:
			default:
				return 'iframe';
		}
	};

	const GetEmptyString = (): string => EMPTY_HEX_CODE;

	const GetNodeName = (selector: Node | null): string => Str.LowerCase(selector?.nodeName ?? '') ?? '';

	const is = <T extends Element>(tagName: string) => (selector: Node | null): selector is T => GetNodeName(selector) === tagName;

	const IsParagraph: (selector: Node | null) => selector is HTMLParagraphElement = is('p');
	const IsBr: (selector: Node | null) => selector is HTMLBRElement = is('br');
	const IsImage: (selector: Node | null) => selector is HTMLImageElement = is('img');
	const IsIFrame: (selector: Node | null) => selector is HTMLIFrameElement = is('iframe');
	const IsVideo: (selector: Node | null) => selector is HTMLVideoElement = is('video');
	const IsAnchor: (selector: Node | null) => selector is HTMLAnchorElement = is('a');

	const CreateStyleVariable = (name: string, value: string): string =>
		Str.Join(' ',
			Str.Merge('--', Options.SHORT_NAME, '-', name, ':'),
			Str.Merge(value, ';')
		);

	const WrapTagHTML = (tagName: string, text: string): string => Str.Merge('<', tagName, '>', text, '</', tagName, '>');

	const IsChildOf = (child: Node, parent: Node): boolean =>
		child === parent || parent.contains(child);

	const IsTextEmpty = (selector: Node | null): boolean =>
		!NodeType.IsText(selector) || Str.IsEmpty(decodeURI(encodeURI(selector.textContent ?? '').replace(ESCAPE_EMPTY_TEXT_REGEX, '')));

	const HasChildNodes = (selector: Node | null): boolean => selector?.hasChildNodes() ?? false;

	const CreateAttrSelector = (attr: string): string => `[${attr}]`;
	const CreateAttrSelectorFromMap = (attrs: Record<string, string>): string => {
		let selector = '';
		Obj.Entries(attrs, (key, value) => {
			selector += CreateAttrSelector(Str.Merge(Str.CapitalToDash(key), '="', value, '"'));
		});
		return selector;
	};

	const CreateStyleSelector = (style: string): string => `[style*="${Str.CapitalToDash(style)}"]`;
	const CreateStyleSelectorFromMap = (styles: Record<string, string>): string => {
		let selector = '';
		Obj.Entries(styles, (name, value) => {
			selector += CreateStyleSelector(Str.Merge(Str.CapitalToDash(name), Str.IsEmpty(value) ? '' : `: ${value}`));
		});
		return selector;
	};

	const createSelectorBy = (target: TSelectorOptionCommon | undefined, stringCallback: (target: string) => string, mapCallback: (target: Record<string, string>) => string): string => {
		if (Type.IsString(target)) return stringCallback(target);
		if (Type.IsArray(target)) {
			let newValue = '';
			Arr.Each(target, attr => {
				newValue += Type.IsString(attr) ? stringCallback(attr) : mapCallback(attr);
			});
			return newValue;
		}
		if (Type.IsObject(target)) return mapCallback(target);

		return '';
	};

	const CreateSelector = (opts: ICreateSelectorOption): string => {
		const { tagName, id, attrs, styles, bNot, children } = opts;

		let selector = Type.IsString(tagName) ? tagName : '';

		if (bNot) selector += ':not(';
		if (Type.IsString(id)) selector += `#${id}`;

		selector += createSelectorBy(attrs, CreateAttrSelector, CreateAttrSelectorFromMap);

		if (Type.IsString(opts.class)) selector += Str.Merge('.', opts.class);

		if (Type.IsArray(opts.class))
			Arr.Each(opts.class, className => {
				if (!Type.IsString(className)) return;
				selector += Str.Merge('.', className);
			});

		selector += createSelectorBy(styles, CreateStyleSelector, CreateStyleSelectorFromMap);

		if (bNot) selector += ')';

		if (Type.IsArray(tagName)) {
			const newSelector: string[] = [];
			Arr.Each(tagName, name => Arr.Push(newSelector, `${name}${selector}`));
			selector = Str.Join(',', ...newSelector);
		}

		if (!!children && Type.IsObject(children)) selector += ` ${CreateSelector(children)}`;

		return selector;
	};

	const isDOMTools = (node: Node | null): node is Element => NodeType.IsElement(node) && node.getAttribute('data-fixed') === 'dom-tool';

	const getDeepestChild = (node: Node, bFirst: boolean): Node | null => {
		let child: Node | null = node;

		while (child) {
			if (isDOMTools(child)) child = child.previousElementSibling;
			const nextChild: Node | null = (bFirst ? child?.firstChild : child?.lastChild) ?? null;
			if (!nextChild) break;
			child = nextChild;
		}

		return child;
	};

	const GetFirstChild = (node: Node | null, bDeep: boolean = false): Node | null => {
		if (!NodeType.IsNode(node)) return null;
		if (!bDeep) return isDOMTools(node.firstChild) ? null : node.firstChild;

		return getDeepestChild(node, true);
	};

	const GetLastChild = (node: Node | null, bDeep: boolean = false): Node | null => {
		if (!NodeType.IsNode(node)) return null;
		if (!bDeep) return isDOMTools(node.lastChild) ? node.lastChild.previousElementSibling : node.lastChild;

		return getDeepestChild(node, false);
	};

	return {
		CreateUEID,
		GetModeTag,
		GetEmptyString,
		GetNodeName,
		IsParagraph,
		IsBr,
		IsImage,
		IsIFrame,
		IsVideo,
		IsAnchor,
		CreateStyleVariable,
		WrapTagHTML,
		IsChildOf,
		IsTextEmpty,
		HasChildNodes,
		CreateAttrSelector,
		CreateAttrSelectorFromMap,
		CreateStyleSelector,
		CreateStyleSelectorFromMap,
		CreateSelector,
		GetFirstChild,
		GetLastChild,
	};
};

export default DOMUtils();