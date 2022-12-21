import { Arr, Type } from '@dynafer/utils';
import Editor from '../../Editor';
import { Formats } from '../Format';
import ToggleInline from '../format/ToggleInline';
import { IFormatDetector } from '../FormatDetector';
import { IFormatUIRegistryUnit, IInlineFormat } from '../FormatType';
import FormatUI from '../FormatUI';
import FormatUtils from '../FormatUtils';
import InlineColor from './InlineColor';
import InlineFont from './InlineFont';

interface IInlineFormatUI {
	Format: IInlineFormat | IInlineFormat[],
	Title: string,
	Icon: string,
	Keys?: string,
}

const Inline = (editor: Editor, detector: IFormatDetector): IFormatUIRegistryUnit => {
	const self = editor;
	const Detector = detector;
	const inlineColor = InlineColor(self);
	const inlineFont = InlineFont(self, detector);

	const InlineFormats: Record<string, IInlineFormatUI> = {
		Bold: { Format: Formats.Bold as IInlineFormat[], Title: 'Bold', Icon: 'Bold', Keys: 'Ctrl+B' },
		Italic: { Format: Formats.Italic as IInlineFormat[], Title: 'Italic', Icon: 'Italic', Keys: 'Ctrl+I' },
		Strikethrough: { Format: Formats.Strikethrough as IInlineFormat[], Title: 'Strikethrough', Icon: 'Strikethrough' },
		Subscript: { Format: Formats.Subscript as IInlineFormat, Title: 'Subscript', Icon: 'Subscript' },
		Superscript: { Format: Formats.Superscript as IInlineFormat, Title: 'Superscript', Icon: 'Superscript' },
		Underline: { Format: Formats.Underline as IInlineFormat[], Title: 'Underline', Icon: 'Underline', Keys: 'Ctrl+U' },
		Code: { Format: Formats.Code as IInlineFormat, Title: 'Code', Icon: 'Code' },
	};

	const UINames = Object.keys(InlineFormats);

	const isDetected = (format: IInlineFormat, nodes: Node[]): boolean => {
		const { Tag, Styles } = format;

		const selector = !!Styles ? FormatUtils.GetStyleSelectorMap(Styles) : Tag;

		for (const node of nodes) {
			if (!!Styles) {
				if (!self.DOM.ClosestByStyle(node as Element, selector)) continue;

				return true;
			}

			if (!self.DOM.Closest(node as Element, selector as string)) continue;

			return true;
		}
		return false;
	};

	const createCommand = (format: IInlineFormat | IInlineFormat[], button: HTMLElement) =>
		<T = boolean>(bActive: T) => {
			const toggler = ToggleInline(self, format);
			toggler.ToggleFromCaret(bActive as boolean);
			if (bActive) FormatUI.UnwrapSameInlineFormats(self, format);
			FormatUI.ToggleActivateClass(button, bActive as boolean);
		};

	const createIconButton = (uiName: string, uiFormat: IInlineFormatUI): HTMLElement => {
		const { Format, Title, Icon, Keys } = uiFormat;
		const button = FormatUI.CreateIconButton(Title, Icon);
		const command = createCommand(Format, button);

		FormatUI.RegisterCommand(self, uiName, command);
		const eventCallback = () => FormatUI.RunCommand(self, uiName, !FormatUI.HasActiveClass(button));
		FormatUI.BindClickEvent(button, eventCallback);
		if (Type.IsString(Keys)) FormatUI.RegisterKeyboardEvent(self, Keys, eventCallback);

		Detector.Register((paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			if (!Type.IsArray(Format)) return FormatUI.ToggleActivateClass(button, isDetected(Format, [node]));

			for (const formatSetting of Format) {
				if (!isDetected(formatSetting, [node])) continue;
				return FormatUI.ToggleActivateClass(button, true);
			}

			FormatUI.ToggleActivateClass(button, false);
		});

		return button;
	};

	const Create = (name: string): HTMLElement => {
		if (FormatUtils.HasFormatName(name, inlineColor.UINames)) return inlineColor.Create(name);
		if (FormatUtils.HasFormatName(name, inlineFont.UINames)) return inlineFont.Create(name);

		const uiName = FormatUtils.GetFormatName(name, UINames);
		const uiFormat = InlineFormats[uiName];

		return createIconButton(uiName, uiFormat);
	};

	return {
		UINames: Arr.MergeUnique(UINames, inlineColor.UINames, inlineFont.UINames),
		Create,
	};
};

export default Inline;