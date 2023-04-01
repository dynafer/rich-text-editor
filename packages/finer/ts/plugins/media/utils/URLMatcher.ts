import { Arr, Obj, Str, Type } from '@dynafer/utils';
import { TConfigurationMap } from '../../../packages/EditorConfigure';

export interface IURLMatcherOptions {
	pattern: RegExp,
	format: string,
	width: number,
	height: number,
	convert?: (url: string) => string,
}

export interface IURLMatachedResult {
	URL: string,
	Format: string | null,
	Width: number | null,
	Height: number | null,
}

const URLMatcher = () => {
	const matchers: IURLMatcherOptions[] = [
		{
			pattern: /(www\.)?(youtube\.com|youtu\.be)\/.+/i,
			format: 'iframe',
			width: 560,
			height: 315,
			convert: (url: string): string => {
				const chunks = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
				if (!chunks[2]) return chunks[0];
				chunks[2] = chunks[2].split(/[^0-9a-z_\-]/i)[0];
				return Str.Merge('https://www.youtube.com/embed/', chunks[2]);
			}
		},
		{
			pattern: /(www\.)?(google\.com|maps\.google)\/(maps\/)?.+/i,
			format: 'iframe',
			width: 600,
			height: 450,
		},
		{
			pattern: /(www\.)?(vimeo\.com|player\.vimeo)\/.+/i,
			format: 'iframe',
			width: 640,
			height: 360,
			convert: (url: string): string => {
				const chunks = url.replace(/(>|<)/gi, '').split(/(vimeo\.com\/)(video\/)?/);
				if (!chunks[3]) return chunks[0];
				chunks[3] = chunks[3].split(/[^0-9]/i)[0];
				return Str.Merge('https://player.vimeo.com/video/', chunks[3]);
			}
		},
		{
			pattern: /(www\.)?(dailymotion\.com|dai\.ly)\/.+/i,
			format: 'iframe',
			width: 640,
			height: 360,
			convert: (url: string): string => {
				const chunks = url.replace(/(>|<)/gi, '').split(/(dailymotion\.com\/|dai\.ly\/)(embed\/)?(video\/)?/);
				if (!chunks[4]) return chunks[0];
				chunks[4] = chunks[4].split(/[^0-9a-z]/i)[0];
				return Str.Merge('https://www.dailymotion.com/embed/video/', chunks[4]);
			}
		}
	];

	const Match = (url: string): IURLMatachedResult => {
		const matched: IURLMatachedResult = {
			URL: url,
			Format: null,
			Width: null,
			Height: null,
		};

		Arr.Each(matchers, (matcher, exit) => {
			if (!matcher.pattern.test(url)) return;

			if (Type.IsFunction<string>(matcher.convert)) matched.URL = matcher.convert(matched.URL);
			matched.Format = matcher.format;
			matched.Width = matcher.width;
			matched.Height = matcher.height;

			exit();
		});

		return matched;
	};

	const Add = (opts: TConfigurationMap<string, string>) => {
		if (
			!Obj.HasProperty(opts.pattern, 'test')
			|| !Type.IsString(opts.format)
			|| !Type.IsNumber(opts.width)
			|| !Type.IsNumber(opts.height)
		) return;

		const matcher: IURLMatcherOptions = {
			pattern: opts.pattern as RegExp,
			format: opts.format,
			width: opts.width,
			height: opts.height,
		};

		if (Type.IsFunction<string>(opts.convert)) matcher.convert = opts.convert;

		Arr.Push(matchers, matcher);
	};

	return {
		Match,
		Add,
	};
};

export default URLMatcher();