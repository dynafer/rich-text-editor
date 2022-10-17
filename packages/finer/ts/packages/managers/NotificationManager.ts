import Editor from 'finer/packages/Editor';
import DOM from 'finer/packages/dom/DOM';
import * as Icons from 'finer/packages/icons/Icons';

export enum ENotificationStatus {
	default,
	warning,
	error
}

interface INotificationManager {
	Show: () => void,
	Hide: () => void,
	Dispatch: (type: ENotificationStatus, text: string) => void,
}

const NotificationManager = (editor: Editor): INotificationManager => {
	const notification = editor.Frame.Notification;
	const stacks: Element[] = [];
	let status = ENotificationStatus.default;

	const Show = () => {
		if (notification.classList.contains('show')) return;
		notification.classList.add('show');
	};

	const Hide = () => {
		if (!notification.classList.contains('show')) return;
		notification.classList.remove('show');
	};

	const Dispatch = (type: ENotificationStatus, text: string) => {
		Show();

		switch (type) {
			case ENotificationStatus.warning:
				console.warn(text);
				break;
			case ENotificationStatus.error:
				console.error(text);
				break;
			default:
				break;
		}

		if (type > status) status = type;

		const wrapper = DOM.Create('div', {
			attrs: {
				id: editor.CreateUEID('message')
			},
			class: [
				editor.CreateUEID('notification-message', false),
				editor.CreateUEID(`notification-message-${ENotificationStatus[type]}`, false)
			],
			children: [
				DOM.Create('div', {
					class: editor.CreateUEID('notification-message-text', false),
					html: text
				})
			]
		});

		const closeButton = DOM.Create('button', {
			class: editor.CreateUEID('notification-message-icon', false),
			html: Icons.Close
		});

		DOM.On(closeButton, 'click', () => {
			DOM.Dispatch(wrapper, 'Close');
		});

		DOM.Insert(wrapper, closeButton);

		DOM.On(wrapper, 'Close', () => {
			const index: number = stacks.indexOf(wrapper);
			if (index !== -1) {
				stacks.splice(index, 1);
			}

			wrapper.remove();

			if (status !== ENotificationStatus.error && stacks.length === 0) {
				Hide();
			}
		});

		DOM.Insert(notification, wrapper);
		stacks.push(wrapper);
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