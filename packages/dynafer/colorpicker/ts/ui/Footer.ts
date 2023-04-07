import { IDOMFactory, Sketcher } from '@dynafer/sketcher';
import { Str } from '@dynafer/utils';

const Footer = (icons: Record<string, string>, texts: Record<string, string>, cancel: () => void, pick: () => void): IDOMFactory[] => {
	const footer = Sketcher.Sketch([
		{
			TagName: 'button',
			Attributes: {
				type: 'button'
			},
			Elements: [Str.Merge(icons.Close, texts.Cancel)],
			Events: [
				['click', cancel]
			]
		},
		{
			TagName: 'button',
			Attributes: {
				type: 'button'
			},
			Elements: [Str.Merge(icons.Check, texts.Confirm)],
			Events: [
				['click', pick]
			]
		}
	]);

	return footer;
};

export default Footer;