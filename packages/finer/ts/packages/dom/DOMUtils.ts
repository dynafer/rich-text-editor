import { Arr, Str, Type, Utils } from '@dynafer/utils';
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
	IsParagraph: (selector: Node | null) => selector is HTMLParagraphElement,
	IsText: (selector: Node | null) => selector is Text,
	IsBr: (selector: Node | null) => selector is HTMLBRElement,
	GetNodeName: (selector: Node | null) => string,
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

	const IsParagraph = (selector: Node | null): selector is HTMLParagraphElement => Str.LowerCase(selector?.nodeName ?? '') === 'p' ?? false;

	const IsText = (selector: Node | null): selector is Text => Str.LowerCase(selector?.nodeName ?? '') === '#text' ?? false;

	const IsBr = (selector: Node | null): selector is HTMLBRElement => Str.LowerCase(selector?.nodeName ?? '') === 'br' ?? false;

	const GetNodeName = (selector: Node | null): string => Str.LowerCase(selector?.nodeName ?? '') ?? '';

	const CreateStyleVariable = (name: string, value: string): string =>
		Str.Join(' ',
			Str.Merge('--', Options.SHORT_NAME, '-', name, ':'),
			Str.Merge(value, ';')
		);

	const WrapTagHTML = (tagName: string, text: string): string => Str.Merge('<', tagName, '>', text, '</', tagName, '>');

	const IsChildOf = (child: Node, parent: Node): boolean =>
		child === parent || parent.contains(child);

	const IsTextEmpty = (selector: Node | null): boolean => !selector ? false : Str.IsEmpty(decodeURI(encodeURI(selector.textContent ?? '').replace(ESCAPE_EMPTY_TEXT_REGEX, '')));

	const HasChildNodes = (selector: Node | null): boolean => selector?.hasChildNodes() ?? false;

	const CreateAttrSelector = (attr: string): string => `[${attr}]`;
	const CreateAttrSelectorFromMap = (attrs: Record<string, string>): string => {
		let selector = '';
		for (const [key, value] of Object.entries(attrs)) {
			selector += CreateAttrSelector(Str.Merge(Str.CapitalToDash(key), '="', value, '"'));
		}
		return selector;
	};

	const CreateStyleSelector = (style: string): string => `[style*="${Str.CapitalToDash(style)}"]`;
	const CreateStyleSelectorFromMap = (styles: Record<string, string>): string => {
		let selector = '';
		for (const [name, value] of Object.entries(styles)) {
			selector += CreateStyleSelector(Str.Merge(Str.CapitalToDash(name), Str.IsEmpty(value) ? '' : `: ${value}`));
		}
		return selector;
	};

	const createSelectorBy = (target: TSelectorOptionCommon | undefined, stringCallback: (target: string) => string, mapCallback: (target: Record<string, string>) => string): string => {
		if (Type.IsString(target)) return stringCallback(target);
		if (Type.IsArray(target)) {
			let newValue = '';
			for (const attr of target) {
				newValue += Type.IsString(attr) ? stringCallback(attr) : mapCallback(attr);
			}
			return newValue;
		}

		if (!Type.IsArray(target) && Type.IsObject(target)) return mapCallback(target);

		return '';
	};

	const CreateSelector = (opts: ICreateSelectorOption): string => {
		const { tagName, id, attrs, styles, bNot, children } = opts;

		let selector = Type.IsString(tagName) ? tagName : '';

		if (bNot) selector += ':not(';
		if (Type.IsString(id)) selector += `#${id}`;

		selector += createSelectorBy(attrs, CreateAttrSelector, CreateAttrSelectorFromMap);

		if (Type.IsString(opts.class)) {
			selector += Str.Merge('.', opts.class);
		}

		if (Type.IsArray(opts.class)) {
			for (const className of opts.class) {
				if (!Type.IsString(className)) continue;
				selector += Str.Merge('.', className);
			}
		}

		selector += createSelectorBy(styles, CreateStyleSelector, CreateStyleSelectorFromMap);

		if (bNot) selector += ')';

		if (Type.IsArray(tagName)) {
			const newSelector: string[] = [];
			for (const name of tagName) {
				Arr.Push(newSelector, `${name}${selector}`);
			}
			selector = Str.Join(',', ...newSelector);
		}

		if (!!children && Type.IsObject(children)) selector += ` ${CreateSelector(children)}`;

		return selector;
	};

	return {
		CreateUEID,
		GetModeTag,
		GetEmptyString,
		IsParagraph,
		IsText,
		IsBr,
		GetNodeName,
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
	};
};

export default DOMUtils();