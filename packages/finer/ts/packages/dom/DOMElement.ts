import Figure, { IFigure } from './elements/Figure';

export interface IDOMElement {
	Figure: IFigure;
}

const DOMElement = () => ({
	Figure,
});

export default DOMElement();