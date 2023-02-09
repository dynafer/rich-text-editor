import Editor from '../Editor';
import TableTools, { ITableTools } from './tools/table/TableTools';

export interface IDOMTools {
	Table: ITableTools,
}

const DOMTools = (editor: Editor): IDOMTools => {
	const self = editor;

	const Table = TableTools(self);

	return {
		Table,
	};
};

export default DOMTools;