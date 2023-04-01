import { Arr } from '@dynafer/utils';
import DOM from '../dom/DOM';
import Editor from '../Editor';
import { ENativeEvents } from '../events/EventSetupUtils';

export enum ENotificationStatus {
	DEFAULT = 'DEFAULT',
	WARNING = 'WARNING',
	ERROR = 'ERROR'
}

interface INotificationManager {
	Show: () => void,
	Hide: () => void,
	Dispatch: (type: ENotificationStatus, text: string, bDestroy?: boolean) => void,
}

const NotificationManager = (editor: Editor): INotificationManager => {
	const self = editor;
	const notification = self.Frame.Notification;
	const stacks: Element[] = [];

	const Show = () => DOM.Show(notification);
	const Hide = () => DOM.Hide(notification);

	const createName = (name: string): string => DOM.Utils.CreateUEID(`notification-${name}`, false);

	const Dispatch = (type: ENotificationStatus, text: string, bDestroy?: boolean) => {
		if (self.IsDestroyed()) return;
		Show();

		switch (type) {
			case ENotificationStatus.WARNING:
				console.warn(text);
				break;
			case ENotificationStatus.ERROR:
				console.error(text);
				if (bDestroy) return self.Destroy();
				break;
			default:
				break;
		}

		const wrapper = DOM.Create('div', {
			attrs: {
				id: createName('message')
			},
			class: [
				createName('message'),
				createName(`message-${ENotificationStatus[type]}`),
			],
			children: [
				DOM.Create('div', {
					class: createName('message-text'),
					html: text
				})
			]
		});

		const closeButton = DOM.Create('button', {
			class: createName('message-icon'),
			html: Finer.Icons.Get('Close')
		});

		DOM.On(closeButton, ENativeEvents.click, () => DOM.Dispatch(wrapper, 'Notification:Close'));

		DOM.Insert(wrapper, closeButton);

		DOM.On(wrapper, 'Notification:Close', () => {
			const index: number = stacks.indexOf(wrapper);
			Arr.Remove(stacks, index);

			DOM.Remove(wrapper, true);

			Hide();
		});

		DOM.Insert(notification, wrapper);
		Arr.Push(stacks, wrapper);
	};

	return {
		Show,
		Hide,
		Dispatch,
	};
};

export {
	INotificationManager,
	NotificationManager
};