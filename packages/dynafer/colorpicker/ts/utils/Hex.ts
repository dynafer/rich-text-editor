const Hex = () => {
	const IsValid = (hex: string): boolean => hex.length === 6 && /[a-f\d]{6}/gi.test(hex);

	return {
		IsValid,
	};
};

export default Hex();