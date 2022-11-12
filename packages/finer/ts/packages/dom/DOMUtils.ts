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
}

const DOMUtils = (): IDOMUtils => {
	const CreateUEID = (id: string = '', bAddNum: boolean = true): string =>
		Utils.CreateUEID(Str.IsEmpty(id) ? Options.ProjectName : `${Options.ProjectName}-${id}`, bAddNum);

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

	const IsParagraph = (selector: Node | null): boolean => selector?.nodeName?.toLowerCase() === 'p' ?? false;

	const IsText = (selector: Node | null): boolean => selector?.nodeName?.toLowerCase() === '#text' ?? false;

	const GetNodeName = (selector: Node | null): string => selector?.nodeName?.toLowerCase() ?? '';

	return {
		CreateUEID,
		GetModeTag,
		GetEmptyString,
		IsParagraph,
		IsText,
		GetNodeName,
	};
};

export default DOMUtils();