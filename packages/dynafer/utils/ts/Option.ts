const projectName: string = 'finer-editor';
const urlPrefix: string = '.';
const pluginUrl: string = `${urlPrefix}/plugins/`;
const cache: Record<string, Record<string, number>> = {
	UEID: {}
};

const JoinPluginUrl = (name: string): string => {
	if (!name.includes('.js')) name = `${name}/${name}.min.js`;
	return `${pluginUrl}${name}`;
};

const CreateUEID = (id: string, addNumber: boolean = true): string => {
	if (!addNumber) return `${projectName}-${id}`;

	const nextNumber = cache.UEID[id] ?? 0;
	if (cache.UEID[id]) ++ cache.UEID[id];
	else cache.UEID[id] = 1;

	return `${projectName}-${id}-${nextNumber}`;
};

export {
	JoinPluginUrl,
	CreateUEID
};