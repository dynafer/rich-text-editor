export interface ICommander {
	Run: <T>(name: string, ...args: T[]) => void,
	Register: (name: string, command: <T>(...args: T[]) => void) => void,
}

const Commander = (): ICommander => {
	const commands: Record<string, <T>(...args: T[]) => void> = {};

	const IsRegistered = (name: string): boolean => !!commands[name];

	const Run = <T>(name: string, ...args: T[]) => {
		if (!IsRegistered(name)) return;

		commands[name](...args);
	};

	const Register = (name: string, command: <T>(...args: T[]) => void) => {
		if (IsRegistered(name)) return;

		commands[name] = command;
	};

	return {
		Run,
		Register,
	};
};

export default Commander;