import { IDOMFactory, Sketcher } from '@dynafer/sketcher';

const Footer = (cancel: () => void, pick: () => void): IDOMFactory[] => {
	const footer = Sketcher.Sketch([
		{
			tagName: 'button',
			attributes: {
				type: 'button'
			},
			elements: ['Cancel'],
			events: [
				['click', cancel]
			]
		},
		{
			tagName: 'button',
			attributes: {
				type: 'button'
			},
			elements: ['Confirm'],
			events: [
				['click', pick]
			]
		}
	]);

	return footer;
};

export default Footer;