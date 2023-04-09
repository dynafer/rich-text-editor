import { Str } from '@dynafer/utils';
import Editor from '../Editor';
import Info from './Info';

interface IToolbarRegistry {
	readonly Name: string,
	Create: () => HTMLElement,
}

const ToolbarRegistry = (editor: Editor) => {
	const self = editor;

	const registries: IToolbarRegistry[] = [Info(self)];

	const Has = (name: string): boolean => {
		for (let index = 0, length = registries.length; index < length; ++index) {
			if (Str.LowerCase(name) === Str.LowerCase(registries[index].Name)) return true;
		}

		return false;
	};

	const getByName = (name: string): IToolbarRegistry | null => {
		for (let index = 0, length = registries.length; index < length; ++index) {
			if (Str.LowerCase(name) === Str.LowerCase(registries[index].Name)) return registries[index];
		}

		return null;
	};

	const Register = (name: string) => {
		const registry = getByName(name);
		if (!registry) return;
		self.Toolbar.Add(name, registry.Create());
	};

	return {
		Has,
		Register,
	};
};

export default ToolbarRegistry;