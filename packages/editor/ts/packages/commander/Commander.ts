import Editor from '../Editor';

export interface ICommander {
	Commands: Record<string, (...args: never[]) => void>,
	Run: <T>(name: string, ...args: T[]) => void,
	Register: <T extends (...args: never[]) => void>(name: string, command: (...args: Parameters<T>) => void) => void,
}

const Commander = (editor: Editor): ICommander => {
	const self = editor;

	const Commands: Record<string, (...args: never[]) => void> = {};

	const IsRegistered = (name: string): boolean => !!Commands[name];

	const Run = <T>(name: string, ...args: T[]) => {
		if (!IsRegistered(name) || self.IsReadOnly()) return;

		self.Dispatch('Command:Before', name);
		Commands[name](...args as never[]);
		self.Dispatch('Command:After', name);
	};

	const Register = <T extends (...args: never[]) => void>(name: string, command: (...args: Parameters<T>) => void) => {
		if (IsRegistered(name)) return;

		Commands[name] = command as (...args: never[]) => void;
	};

	return {
		Commands,
		Run,
		Register,
	};
};

export default Commander;