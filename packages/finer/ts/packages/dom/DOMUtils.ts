import { Utils, Type } from 'dynafer/utils';
import Options, { EModeEditor } from '../../Options';

export interface IDOMUtils {
	CreateUEID: (id?: string, addNumber?: boolean) => string,
	GetModeTag: (mode: EModeEditor) => string,
}

const DOMUtils = (): IDOMUtils => {
	const CreateUEID = (id: string = '', addNumber: boolean = true): string => {
		id = Type.IsEmpty(id) ? Options.ProjectName : `${Options.ProjectName}-${id}`;
		return Utils.CreateUEID(id, addNumber);
	};

	const GetModeTag = (mode: EModeEditor): string => {
		switch (mode) {
			case EModeEditor.inline:
				return 'div';
			case EModeEditor.classic:
			default:
				return 'iframe';
		}
	};

	return {
		CreateUEID,
		GetModeTag,
	};
};

export default DOMUtils();