const PROJECT_NAME = 'finer-editor';
const URL_PREFIX = '.';
const PLUGIN_URL = `${URL_PREFIX}/plugins/`;

const JoinPluginUrl = (name: string): string => {
	if (!name.includes('.js')) name = name.concat('/', name, '.min.js');
	return PLUGIN_URL.concat(name);
};

const UEID_CACHE: IMap<number> = {};

const CreateUEID = (id: string, addNumber: boolean = true): string => {
	if (!addNumber) return `${PROJECT_NAME}-${id}`;

	const nextNumber = UEID_CACHE[id] ?? 0;
	if (UEID_CACHE[id]) ++ UEID_CACHE[id];
	else UEID_CACHE[id] = 1;

	return `${PROJECT_NAME}-${id}-${nextNumber}`;
};

export {
	PROJECT_NAME,
	JoinPluginUrl,
	CreateUEID
};