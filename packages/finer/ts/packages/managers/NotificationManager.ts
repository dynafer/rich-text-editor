import { Arr } from '@dynafer/utils';
import Editor from '../Editor';
import DOM from '../dom/DOM';
import { ENativeEvents } from '../events/EventSetupUtils';

export enum ENotificationStatus {
	DEFAULT = 'DEFAULT',
	WARNING = 'WARNING',
	ERROR = 'ERROR'
}

interface INotificationManager {
	Show: () => void,
	Hide: () => void,
	Dispatch: (type: ENotificationStatus, text: string) => void,
}

const NotificationManager = (editor: Editor): INotificationManager => {
	const self = editor;
	const notification = self.Frame.Notification;
	const stacks: Element[] = [];
	let status = ENotificationStatus.DEFAULT;

	const Show = () => {
		DOM.Show(notification);
	};

	const Hide = () => {
		DOM.Hide(notification);
	};

	const Dispatch = (type: ENotificationStatus, text: string) => {
		if (self.IsDestroyed()) return;
		Show();

		switch (type) {
			case ENotificationStatus.WARNING:
				console.warn(text);
				break;
			case ENotificationStatus.ERROR:
				console.error(text);
				self.Destroy();
				return;
			default:
				break;
		}

		if (type > status) status = type;

		const wrapper = DOM.Create('div', {
			attrs: {
				id: DOM.Utils.CreateUEID('message')
			},
			class: [
				DOM.Utils.CreateUEID('notification-message', false),
				DOM.Utils.CreateUEID(`notification-message-${ENotificationStatus[type]}`, false)
			],
			children: [
				DOM.Create('div', {
					class: DOM.Utils.CreateUEID('notification-message-text', false),
					html: text
				})
			]
		});

		const closeButton = DOM.Create('button', {
			class: DOM.Utils.CreateUEID('notification-message-icon', false),
			html: Finer.Icons.Get('Close')
		});

		DOM.On(closeButton, ENativeEvents.click, () => {
			DOM.Dispatch(wrapper, 'Notification:Close');
		});

		DOM.Insert(wrapper, closeButton);

		DOM.On(wrapper, 'Notification:Close', () => {
			const index: number = stacks.indexOf(wrapper);
			if (index !== -1) {
				stacks.splice(index, 1);
			}

			DOM.Remove(wrapper, true);

			if (status !== ENotificationStatus.ERROR && stacks.length === 0) {
				Hide();
			}
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