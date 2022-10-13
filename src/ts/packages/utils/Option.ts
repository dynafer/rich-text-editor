const URL_PREFIX = '.';
const PLUGIN_URL = `${URL_PREFIX}/plugins/`;

const JoinPluginUrl = (name: string): string => {
	if (!name.includes('.js')) name = name.concat('/', name, '.min.js');
	return PLUGIN_URL.concat(name);
};

export {
	JoinPluginUrl
};