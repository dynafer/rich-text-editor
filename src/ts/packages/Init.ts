import IConfiguration from './Configuration';

const Init = (config: IConfiguration): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (!config.selector) return reject('Selector of configuration must be provided');
		resolve();
	});
};

export default Init;