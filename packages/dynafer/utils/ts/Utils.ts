const cache: Record<string, Record<string, number>> = {
	UEID: {}
};

const CreateUEID = (id: string, addNumber: boolean = true): string => {
	if (!addNumber) return id;

	const nextNumber = cache.UEID[id] ?? 0;

	if (cache.UEID[id]) ++ cache.UEID[id];
	else cache.UEID[id] = 1;

	return `${id}-${nextNumber}`;
};

export {
	CreateUEID
};