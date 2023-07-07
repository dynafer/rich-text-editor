import Figure, { IFigure } from './elements/Figure';
import Table, { ITable } from './elements/Table';

export interface IDOMElement {
	readonly Figure: IFigure,
	readonly Table: ITable,
}

const DOMElement = () => ({
	Figure,
	Table,
});

export default DOMElement();