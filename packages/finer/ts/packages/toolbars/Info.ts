import { IDOMFactory, Sketcher } from '@dynafer/sketcher';
import { Arr, Str } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents, PreventEvent } from '../events/EventSetupUtils';
import FormatUI from '../formatter/FormatUI';

const Info = (editor: Editor) => {
	const self = editor;

	const Name = 'Info';
	const title = self.Lang('toolbar.info', 'Information');

	const icons = {
		Check: Finer.Icons.Get('Check'),
		Close: Finer.Icons.Get('Close')
	};

	const getNavigation = (content: IDOMFactory): IDOMFactory => {
		const sketch = (name: string, bActive: boolean): IDOMFactory => Sketcher.SketchOne({
			TagName: 'button',
			Attributes: { type: 'button' },
			Classes: bActive ? ['active'] : [],
			Elements: [name],
		});

		const shortcuts = sketch(self.Lang('toolbar.shortcuts', 'Shortcuts'), true);

		shortcuts.Bind(ENativeEvents.click, event => {
			PreventEvent(event);
			shortcuts.AddClass('active');
			DOM.Show(content.GetChildren()[0].Self);
		});

		return Sketcher.SketchOne({
			TagName: 'info-navigation',
			Elements: [shortcuts]
		});
	};

	const getContent = (): IDOMFactory => {
		const shortcuts: string[] = [];

		Arr.Each(self.GetShortcuts(), shortcut => {
			const label = DOM.Utils.WrapTagHTML('strong', Str.Merge(shortcut.Title, ':'));
			const keys = DOM.Utils.WrapTagHTML('span', shortcut.Keys);
			Arr.Push(shortcuts, DOM.Utils.WrapTagHTML('div', Str.Merge(label, keys)));
		});

		const shortcutsContent = Sketcher.SketchOne({
			TagName: 'div',
			Classes: [DOM.Utils.CreateUEID('shortcut-content', false)],
			Elements: shortcuts
		});

		return Sketcher.SketchOne({
			TagName: 'info-content',
			Elements: [shortcutsContent]
		});
	};

	const getBody = (): IDOMFactory => {
		const content = getContent();
		const navigation = getNavigation(content);

		return Sketcher.SketchOne({
			TagName: 'info-wrap',
			Elements: [navigation, content]
		});
	};

	const getFooter = (exit: () => void): IDOMFactory =>
		Sketcher.SketchOne({
			TagName: 'button',
			Attributes: {
				type: 'button'
			},
			Elements: [Str.Merge(icons.Check, self.Lang('confirm', 'Confirm'))],
			Events: [
				['click', exit]
			]
		});

	const Create = (): HTMLElement => {
		const button = FormatUI.CreateIconButton(title, Name);

		const create = () => {
			const schema = Sketcher.Modal('info', {
				Title: title,
				Icons: icons,
				Body: getBody(),
				Footer: getFooter(() => schema.Schema.Destroy())
			});

			DOM.InsertAfter(schema.Schema.GetBody(), schema.Schema.Self);
		};

		FormatUI.BindClickEvent(button, create);

		return button;
	};

	return {
		Name,
		Create,
	};
};

export default Info;