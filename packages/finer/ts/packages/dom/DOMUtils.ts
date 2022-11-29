import { Str, Utils } from '@dynafer/utils';
import Options, { EModeEditor } from '../../Options';

const EMPTY_HEX_CODE = '&#xfeff;';

export interface IDOMUtils {
	CreateUEID: (id?: string, bAddNum?: boolean) => string,
	GetModeTag: (mode: EModeEditor) => string,
	GetEmptyString: () => string,
	IsParagraph: (selector: Node | null) => boolean,
	IsText: (selector: Node | null) => boolean,
	GetNodeName: (selector: Node | null) => string,
	CreateStyleVariable: (name: string, value: string) => string,
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

	const IsParagraph = (selector: Node | null): boolean => Str.LowerCase(selector?.nodeName ?? '') === 'p' ?? false;

	const IsText = (selector: Node | null): boolean => Str.LowerCase(selector?.nodeName ?? '') === '#text' ?? false;

	const GetNodeName = (selector: Node | null): string => Str.LowerCase(selector?.nodeName ?? '') ?? '';

	const CreateStyleVariable = (name: string, value: string): string =>
		Str.Join(' ',
			Str.Merge('--', Options.SHORT_NAME, '-', name, ':'),
			Str.Merge(value, ';')
		);

	return {
		CreateUEID,
		GetModeTag,
		GetEmptyString,
		IsParagraph,
		IsText,
		GetNodeName,
		CreateStyleVariable,
	};
};

export default DOMUtils();