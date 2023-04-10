import Editor from '../Editor';

export interface ICommander {
	commands: Record<string, (...args: never[]) => void>,
	Run: <T>(name: string, ...args: T[]) => void,
	Register: <T extends (...args: never[]) => void>(name: string, command: (...args: Parameters<T>) => void) => void,
}

const Commander = (editor: Editor): ICommander => {
	const self = editor;

	const commands: Record<string, (...args: never[]) => void> = {};

	const IsRegistered = (name: string): boolean => !!commands[name];

	const Run = <T>(name: string, ...args: T[]) => {
		if (!IsRegistered(name)) return;

		self.Dispatch('Command:Before', name);
		commands[name](...args as never[]);
		self.Dispatch('Command:After', name);
	};

	const Register = <T extends (...args: never[]) => void>(name: string, command: (...args: Parameters<T>) => void) => {
		if (IsRegistered(name)) return;

		commands[name] = command as (...args: never[]) => void;
	};

	return {
		commands,
		Run,
		Register,
	};
};

export default Commander;