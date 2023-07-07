# Plugins
## Provided plugins
### You can check the plugins with example files in ***example/plugins*** folder.
- ### link
	- You can add a hyperlink from the editor.
	- You should add a toolbar called 'link'.
- ### lists
	- You can add two types of lists from the editor.
	- To use them, you must add a toolbar(s) called 'numberList', 'bulletList'.
- ### media
	- You can add an image and a media(video, map, ...) from the editor.
	- To use them, you must add a toolbar(s) called 'image', 'media'.
	- image configuration
		- imageConfiguration or image_configuration
		- accept: allowed mime types
			- Optional
			- Default: all
			- jpeg, png, gif, bmp, svg+xml, webp, tiff, x-icon, vnd.microsoft.icon
		- multiple: boolean
			- Optional
			- Default: true
			- You can allow/prevent user to upload multiple files.
		- uploadCallback: asynchronous function
			- Optional
			- This callback will be called before the image file(s) adds to the editor.
			- The return value must be string or a string array.
		```javascript
			RichEditor.Init({
				...
				imageConfiguration: {
					accept: 'png, jpeg, icon',
					multiple: true,
					uploadCallback: blobList => new Promise((resolve, reject) => {
						// do something
					}),
				},
				...
			});
		```
	- media configuration
		- mediaUrlPatterns or media_url_patterns
		- Youtube, Vimeo, Google Maps and Dailymotion patterns are already provided.
		- This will add more patterns.
		- This will convert a tag name, sizes, and url.
		- This must be an object array.
		- pattern: Regex
			- Required
		- format: string
			- Required
			- Tag name (iframe, video, audio, ...)
		- width: number
			- Required
		- height: number
			- Required
		- convert: function
			- Optional
			- This is to convert matched url patterns to other url.
		```javascript
			RichEditor.Init({
				...
				mediaUrlPatterns: [
					{
						pattern: /(www\.)?(youtube\.com|youtu\.be)\/.+/i,
						format: 'iframe',
						width: 560,
						height: 315,
						convert: (url) => {
							// do somthing
						}
					}
				],
				...
			});
		```
- ### table
	- You can add a table from the editor.
	- To use them, you must add a toolbar called 'table'.

<br>

## Custom Plugins
- There is a template in ***packages/editor/plugins/template***.