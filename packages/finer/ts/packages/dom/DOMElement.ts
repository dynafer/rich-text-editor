import Figure, { IFigure } from './elements/Figure';
import Table, { ITable } from './elements/Table';

export interface IDOMElement {
	Figure: IFigure,
	Table: ITable,
}

const DOMElement = () => ({
	Figure,
	Table,
});

export default DOMElement();