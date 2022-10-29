const cache: Record<string, Record<string, number>> = {
	UEID: {}
};

const CreateUEID = (id: string, bAddNum: boolean = true): string => {
	if (!bAddNum) return id;

	const nextNum = cache.UEID[id] ?? 0;

	if (cache.UEID[id]) ++ cache.UEID[id];
	else cache.UEID[id] = 1;

	return `${id}-${nextNum}`;
};

export {
	CreateUEID
};