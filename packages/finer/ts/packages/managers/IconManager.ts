import { Obj, Str, Type } from '@dynafer/utils';

export interface IIconManager {
	Has: (icon: string) => boolean,
	Get: (icon: string) => string,
	Register: (keyOrMap: string | Record<string, string>, value?: string) => void,
}

const IconManager = () => {
	const icons: Record<string, string> = {};

	const Has = (icon: string): boolean => !!icons[icon];

	const Get = (icon: string): string => Has(icon) ? icons[icon] : icon;

	const Register = (keyOrMap: string | Record<string, string>, value?: string) => {
		if (Type.IsString(keyOrMap)) {
			if (Str.IsEmpty(keyOrMap) || !Type.IsString(value) || Str.IsEmpty(value)) return;
			icons[keyOrMap] = value;
			return;
		}

		Obj.Entries(keyOrMap, (key, icon) => {
			icons[key] = icon;
		});
	};

	return {
		Has,
		Get,
		Register,
	};
};

export default IconManager();