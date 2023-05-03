import { NodeType } from '@dynafer/dom-control';
import { Arr, Obj, Str, Type, UID } from '@dynafer/utils';
import Options from '../../Options';

export const REGEX_EMPTY_TEXT = /(%EF%BB%BF|%0A)/gi;
export const REGEX_COMMENTS = /<!--.*?-->/gs;
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
	GetEmptyString: () => string,
	GetNodeName: (selector: Node | null) => string,
	IsAnchor: (selector: Node | null) => selector is HTMLAnchorElement,
	IsBr: (selector: Node | null) => selector is HTMLBRElement,
	IsImage: (selector: Node | null) => selector is HTMLImageElement,
	IsIFrame: (selector: Node | null) => selector is HTMLIFrameElement,
	IsParagraph: (selector: Node | null) => selector is HTMLParagraphElement,
	IsSpan: (selector: Node | null) => selector is HTMLSpanElement,
	IsTextArea: (selector: Node | null) => selector is HTMLTextAreaElement,
	IsVideo: (selector: Node | null) => selector is HTMLVideoElement,
	CreateStyleVariable: (name: string, value: string) => string,
	WrapTagHTML: (tagName: string, text: string) => string,
	EscapeComments: (html: string) => string,
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
		UID.CreateUEID(Str.IsEmpty(id) ? Options.PROJECT_NAME : `${Options.PROJECT_NAME}-${id}`, bAddNum);

	const GetEmptyString = (): string => EMPTY_HEX_CODE;

	const GetNodeName = (selector: Node | null): string => Str.LowerCase(selector?.nodeName ?? '');

	const is = <T extends Element>(tagName: string) => (selector: Node | null): selector is T => GetNodeName(selector) === tagName;

	const IsAnchor: (selector: Node | null) => selector is HTMLAnchorElement = is('a');
	const IsBr: (selector: Node | null) => selector is HTMLBRElement = is('br');
	const IsIFrame: (selector: Node | null) => selector is HTMLIFrameElement = is('iframe');
	const IsImage: (selector: Node | null) => selector is HTMLImageElement = is('img');
	const IsParagraph: (selector: Node | null) => selector is HTMLParagraphElement = is('p');
	const IsSpan: (selector: Node | null) => selector is HTMLSpanElement = is('span');
	const IsTextArea: (selector: Node | null) => selector is HTMLTextAreaElement = is('textarea');
	const IsVideo: (selector: Node | null) => selector is HTMLVideoElement = is('video');

	const CreateStyleVariable = (name: string, value: string): string =>
		Str.Join(' ',
			Str.Merge('--', Options.SHORT_NAME, '-', name, ':'),
			Str.Merge(value, ';')
		);

	const WrapTagHTML = (tagName: string, text: string): string => Str.Merge('<', tagName, '>', text, '</', tagName, '>');

	const EscapeComments = (html: string): string => html.replace(REGEX_COMMENTS, '');

	const IsChildOf = (child: Node, parent: Node): boolean =>
		child === parent || parent.contains(child);

	const IsTextEmpty = (selector: Node | null): boolean =>
		!NodeType.IsText(selector) || Str.IsEmpty(decodeURI(encodeURI(selector.textContent ?? '').replace(REGEX_EMPTY_TEXT, '')));

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

	const isPartsTool = (node: Node | null): node is Element => NodeType.IsElement(node) && node.getAttribute('data-fixed') === 'parts-tool';

	const getDeepestChild = (node: Node, bFirst: boolean): Node | null => {
		let child: Node | null = node;

		while (child) {
			if (isPartsTool(child)) child = child.previousElementSibling;
			const nextChild: Node | null = (bFirst ? child?.firstChild : child?.lastChild) ?? null;
			if (!nextChild) break;
			child = nextChild;
		}

		return child;
	};

	const GetFirstChild = (node: Node | null, bDeep: boolean = false): Node | null => {
		if (!NodeType.IsNode(node)) return null;
		if (!bDeep) return isPartsTool(node.firstChild) ? null : node.firstChild;

		return getDeepestChild(node, true);
	};

	const GetLastChild = (node: Node | null, bDeep: boolean = false): Node | null => {
		if (!NodeType.IsNode(node)) return null;
		if (!bDeep) return isPartsTool(node.lastChild) ? node.lastChild.previousElementSibling : node.lastChild;

		return getDeepestChild(node, false);
	};

	return {
		CreateUEID,
		GetEmptyString,
		GetNodeName,
		IsAnchor,
		IsBr,
		IsIFrame,
		IsImage,
		IsParagraph,
		IsSpan,
		IsTextArea,
		IsVideo,
		CreateStyleVariable,
		WrapTagHTML,
		EscapeComments,
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