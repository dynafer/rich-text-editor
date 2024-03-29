const cache: Record<string, Record<string, number>> = {
	UEID: {}
};

export const CreateUEID = (id: string, bAddNum: boolean = true): string => {
	if (!bAddNum) return id;

	const nextNum = cache.UEID[id] ?? 0;

	if (cache.UEID[id]) ++cache.UEID[id];
	else cache.UEID[id] = 1;

	return `${id}-${nextNum}`;
};

export const CreateUUID = (): string => {
	let date = new Date().getTime();
	return 'xxxyxx-xxxx-xyxxxyxxx'.replace(/[xy]/g, char => {
		const r = (date + Math.random() * 16) % 16 | 0;
		date = Math.floor(date / 16);
		return (char === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
};