import { Str, Utils } from '@dynafer/utils';
import Options, { EModeEditor } from '../../Options';

export const ESCAPE_EMPTY_TEXT_REGEX = /(%EF%BB%BF|%0A)/gi;
export const EMPTY_HEX_CODE = '&#xfeff;';

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
	};
};

export default DOMUtils();