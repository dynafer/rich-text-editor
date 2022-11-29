export interface IHexUtils {
	IsValid: (hex: string) => boolean;
}

const Hex = (): IHexUtils => {
	const IsValid = (hex: string): boolean => (hex.replace('#', '').length === 3 || hex.replace('#', '').length === 6) && /[a-f\d]{3,6}/gi.test(hex);

	return {
		IsValid,
	};
};

export default Hex();