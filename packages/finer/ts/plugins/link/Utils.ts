import { Str } from '@dynafer/utils';

const URL_REGEX = /^((?:https?|ftp):\/\/|mailto:)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROTOCOL_REGEX = /^(https?|ftp|mailto):/;

export const IsURL = (value: string): boolean => URL_REGEX.test(value);
export const IsEmail = (value: string): boolean => EMAIL_REGEX.test(value);
export const HasProtocol = (value: string): boolean => PROTOCOL_REGEX.test(value);

export const ConvertURL = (value: string): string => {
	if (IsURL(value)) return HasProtocol(value) ? value : Str.Merge('https://', value);

	if (IsEmail(value)) return Str.Merge('mailto:', value);

	return value;
};
