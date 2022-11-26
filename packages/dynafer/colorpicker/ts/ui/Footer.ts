import { IDOMFactory, Sketcher } from '@dynafer/sketcher';

const Footer = (cancel: () => void, pick: () => void): IDOMFactory[] => {
	const footer = Sketcher.Sketch([
		{
			TagName: 'button',
			Attributes: {
				type: 'button'
			},
			Elements: ['Cancel'],
			Events: [
				['click', cancel]
			]
		},
		{
			TagName: 'button',
			Attributes: {
				type: 'button'
			},
			Elements: ['Confirm'],
			Events: [
				['click', pick]
			]
		}
	]);

	return footer;
};

export default Footer;