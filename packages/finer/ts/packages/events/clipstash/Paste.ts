import { Arr, Str } from '@dynafer/utils';
import Editor from '../../Editor';
import FormatUtils from '../../formatter/FormatUtils';
import { PreventEvent } from '../EventSetupUtils';
import InputUtils from '../update/InputUtils';

const Paste = (editor: Editor, event: ClipboardEvent) => {
	const self = editor;
	const DOM = self.DOM;
	const CaretUtils = self.Utils.Caret;
	const inputUtils = InputUtils(self);

	if (!event.clipboardData || Arr.IsEmpty(Arr.Convert(event.clipboardData.items))) return;

	const caret = CaretUtils.Get();
	const cells = DOM.Element.Table.GetSelectedCells(self);
	const { Figure } = DOM.Element.Figure.Find(!caret ? (cells[0] ?? null) : FormatUtils.GetParentIfText(caret.Start.Node));
	if (!Figure) return;

	const callback = (html: string) => {
		const fakeCaret = CaretUtils.CreateFake(Figure, 0, Figure, 0);

		const fragment = inputUtils.ConvertHTMLToFragment(html);
		inputUtils.FinishInsertion(fakeCaret, fragment);
	};

	Arr.Each(event.clipboardData.items, data => {
		if (!Str.Contains(data.type, 'html')) return;
		PreventEvent(event);

		data.getAsString(callback);
	});
};

export default Paste;