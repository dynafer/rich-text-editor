import Editor from '../../Editor';
import { ENativeEvents, PreventEvent } from '../EventSetupUtils';

const DragImage = (editor: Editor, event: DragEvent) => {
	const self = editor;
	const DOM = self.DOM;

	if (DOM.Utils.GetNodeName(event.target as Node) !== 'img') return;

	const image = event.target as HTMLImageElement;
	let figure = image.parentElement;

	if (!figure) {
		figure = DOM.Create('figure', {
			attrs: {
				type: 'img',
				contenteditable: 'false',
			}
		});

		DOM.InsertAfter(image, figure);
		DOM.Insert(figure, image);
	}

	const clonedFigure = DOM.Clone(figure, true) as HTMLElement;
	DOM.Remove(DOM.Select({ attrs: { dataType: 'image-tool' } }, clonedFigure));

	event.dataTransfer?.setData('text/html', DOM.GetOuterHTML(clonedFigure));
	event.dataTransfer?.setDragImage(image, 0, 0);

	const dropImage = (e: DragEvent) => {
		PreventEvent(e);
		if (e.dataTransfer?.dropEffect === 'none') return;
		DOM.Remove(figure, true);
	};

	DOM.On(image, ENativeEvents.dragend, e => {
		dropImage(e);
		DOM.Off(image, ENativeEvents.dragend, dropImage);
	});
};

export default DragImage;