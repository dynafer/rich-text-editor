import { Style } from '@dynafer/dom-control';
import { Arr, Instance, Str } from '@dynafer/utils';
import { IUISchemaMap } from '../types/UISchema';
import { IUISettingMap } from '../types/UISetting';
import { GetLimitation } from '../utils/UIUtils';
import Sketcher from './Sketcher';

const PaletteGuide = (setting: IUISettingMap['PaletteGuide']): IUISchemaMap['PaletteGuide'] => {
	const { palette, bOnlyVertical, events, guiding } = setting;
	const schema = Sketcher.SketchOne({
		tagName: 'div',
		attributes: {
			draggable: 'false',
		},
		events,
	});

	const guide = schema.Self;

	const getHalfWidth = (): number => guide.offsetWidth / 2;
	const getHalfHeight = (): number => guide.offsetHeight / 2;

	const GetX = (): number => guide.offsetLeft + getHalfWidth();
	const GetY = (): number => guide.offsetTop + getHalfHeight();

	const setTop = (y: number) => Style.Set(guide, 'top', `${y}px`);
	const setLeft = (x: number) => Style.Set(guide, 'left', `${x}px`);

	const SetGuidance = (x: number, y: number) => {
		const coordX = GetLimitation(x, 0, palette.Self.offsetWidth) - getHalfWidth();
		const coordY = GetLimitation(y, 0, palette.Self.offsetHeight) - getHalfHeight();
		setTop(coordY);
		if (!bOnlyVertical) setLeft(coordX);

		guiding();
	};

	let bDragging = false;

	const startEvents = ['mousedown', 'touchstart'];
	const moveEvents = ['mousemove', 'touchmove'];
	const endEvents = ['mouseup', 'touchend'];

	const guideEvent = (event: MouseEvent | TouchEvent) => {
		const type = Str.LowerCase(event.type);

		if (Arr.Contains(endEvents, type)) {
			bDragging = false;
			return;
		}

		if (!guide.parentElement) return;

		if (Arr.Contains(startEvents, type)) bDragging = true;
		if (Arr.Contains(moveEvents, type) && !bDragging) return;

		if (Instance.Is(event, MouseEvent) && event.buttons === 0) {
			bDragging = false;
			return;
		}

		const eventItem = Instance.Is(event, TouchEvent) ? event.touches[0] : event;
		SetGuidance(eventItem.clientX - guide.parentElement.offsetLeft, eventItem.clientY - guide.parentElement.offsetTop);
	};

	for (const eventName of Arr.MergeUnique(startEvents, moveEvents, endEvents)) {
		palette.Bind(eventName, guideEvent as EventListener);
		schema.Bind(eventName, guideEvent as EventListener);
	}

	for (const dragEvent of ['drag', 'dragstart', 'dragend', 'dragenter', 'dragleave', 'dragover']) {
		schema.Bind(dragEvent, (event: Event) => {
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();
		});
	}

	return {
		Schema: schema,
		Self: schema,
		GetX,
		GetY,
		SetGuidance,
	};
};

export default PaletteGuide;