export default (): void => {
	finer.managers.plugin.Add('bold', () => {
		console.log('loaded');
	});
};