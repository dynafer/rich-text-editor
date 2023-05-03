import { DOMFactory, Sketcher } from '@dynafer/sketcher';
import { Str } from '@dynafer/utils';

const Footer = (icons: Record<string, string>, texts: Record<string, string>, cancel: () => void, pick: () => void): DOMFactory[] => {
	const footer = Sketcher.Sketch([
		{
			TagName: 'button',
			Attributes: {
				type: 'button'
			},
			Elements: [Str.Merge(icons.Close, '<span>', texts.Cancel, '</span>')],
			Events: [
				['click', cancel]
			]
		},
		{
			TagName: 'button',
			Attributes: {
				type: 'button'
			},
			Elements: [Str.Merge(icons.Check, '<span>', texts.Apply, '</span>')],
			Events: [
				['click', pick]
			]
		}
	]);

	return footer;
};

export default Footer;