import { Arr, Obj, Type } from '@dynafer/utils';
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
	const DOM = self.DOM;
	const Detector = detector;
	const inlineColor = InlineColor(self, detector);
	const inlineFont = InlineFont(self, detector);

	const InlineFormats: Record<string, IInlineFormatUI> = {
		Bold: { Format: Formats.Bold as IInlineFormat[], Title: Finer.ILC.Get('format.bold') ?? 'Bold', Icon: 'Bold', Keys: 'Ctrl+B' },
		Italic: { Format: Formats.Italic as IInlineFormat[], Title: Finer.ILC.Get('format.italic') ?? 'Italic', Icon: 'Italic', Keys: 'Ctrl+I' },
		Strikethrough: { Format: Formats.Strikethrough as IInlineFormat[], Title: Finer.ILC.Get('format.strikethrough') ?? 'Strikethrough', Icon: 'Strikethrough' },
		Subscript: { Format: Formats.Subscript as IInlineFormat, Title: Finer.ILC.Get('format.subscript') ?? 'Subscript', Icon: 'Subscript' },
		Superscript: { Format: Formats.Superscript as IInlineFormat, Title: Finer.ILC.Get('format.superscript') ?? 'Superscript', Icon: 'Superscript' },
		Underline: { Format: Formats.Underline as IInlineFormat[], Title: Finer.ILC.Get('format.underline') ?? 'Underline', Icon: 'Underline', Keys: 'Ctrl+U' },
		Code: { Format: Formats.Code as IInlineFormat, Title: Finer.ILC.Get('format.code') ?? 'Code', Icon: 'Code' },
	};

	const UINames = Obj.Keys(InlineFormats);

	const isDetected = (format: IInlineFormat, nodes: Node[]): boolean => {
		const { Tag, Styles } = format;

		const selector = !!Styles ? FormatUtils.GetStyleSelectorMap(Styles) : Tag;

		for (let index = 0, length = nodes.length; index < length; ++index) {
			const node = nodes[index];
			if (!!Styles) {
				if (!DOM.ClosestByStyle(node, selector)) continue;

				return true;
			}

			if (!Type.IsString(selector) || !DOM.Closest(node, selector)) continue;

			return true;
		}
		return false;
	};

	const createCommand = (format: IInlineFormat | IInlineFormat[], button: HTMLElement) =>
		<T = boolean>(bActive: T) => {
			FormatUI.ToggleActivateClass(button, bActive as boolean);
			const toggler = ToggleInline(self, format);
			if (bActive) FormatUI.UnwrapSameInlineFormats(self, format);
			toggler.ToggleFromCaret(bActive as boolean);
		};

	const createIconButton = (uiName: string, uiFormat: IInlineFormatUI): HTMLElement => {
		const { Format, Title, Icon, Keys } = uiFormat;
		const button = FormatUI.CreateIconButton(Title, Icon);
		const command = createCommand(Format, button);

		FormatUI.RegisterCommand(self, uiName, command);
		const eventCallback = () => {
			if (FormatUI.IsDisabled(button)) return;
			FormatUI.RunCommand(self, uiName, !FormatUI.HasActiveClass(button));
		};
		FormatUI.BindClickEvent(button, eventCallback);
		if (Type.IsString(Keys)) FormatUI.RegisterKeyboardEvent(self, Keys, eventCallback);

		const isNearDisableList = (node: Node): boolean => {
			if (!Type.IsArray(Format)) return FormatUI.IsNearDisableList(Format.DisableList, button, node);

			let bNearDisableList = false;
			Arr.Each(Format, (format, exit) => {
				bNearDisableList = FormatUI.IsNearDisableList(format.DisableList, button, node);
				if (bNearDisableList) exit();
			});
			return bNearDisableList;
		};

		Detector.Register((paths: Node[]) => {
			const node = FormatUtils.GetParentIfText(paths[0]);
			const bNearDisableList = isNearDisableList(node);
			if (bNearDisableList) return;

			if (!Type.IsArray(Format)) return FormatUI.ToggleActivateClass(button, isDetected(Format, paths));

			for (let index = 0, length = Format.length; index < length; ++index) {
				const formatSetting = Format[index];
				if (!isDetected(formatSetting, paths)) continue;
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