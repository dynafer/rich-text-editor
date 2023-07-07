# Toolbar
## Configuration
- **toolbar**
	- a string array
- **toolbarStyle** or **toolbar_style**
	- Optional
	- Default: scroll
	- Available: scroll, float
	- You can check the styles with example files in ***example/toolbar*** folder.
- **toolbarGroup** or **toolbar_group**
	- an object
	- This is grouping toolbar items.
	```javascript
		RichEditor.Init({
			...
			toolbar: ['styles'],
			toolbarGroup: {
				styles: ['heading_style', 'block_style'],
			}
			...
		});
	```

## Provided toolbar items
- **alignment**
	- Chnage an alignment of a line.
	- Available: justify, left, center, right
- **backColor**
	- Change text background color.
- **block_style**
	- Block styles (blockquote, div, p, pre)
- **bold**
	- Toggle a **bold** style.
- **code**
	- Toggle a <code>code</code> style.
- **fontFamily**
	- Change font family.
	- Default: 
		- Arial: arial, sans-serif
		- Arial Black: arial black, sans-serif
		- Courier New: courier new, monospace
		- Georgia: georgia, serif
		- Helvetica: helvetica, sans-serif
		- Lucida Console: lucida console
		- Monaco: monaco
		- Noto Sans: noto sans, sans-serif
		- Times New Soman: times new roman, serif
		- Verdana: verdana, sans-serif
	- Font family list configuration
		- **fontFamilyOptions** or **font_family_options**
			- an object
			- The key is a label.
			- The value is a style.
		```javascript
			RichEditor.Init({
				...
				toolbar: ['fontFamily'],
				fontFamilyOptions: {
					'Arial Black': 'arial black, sans-serif'
				}
				...
			});
		```
- **fontSize**
	- Change font size.
	- Default: 9pt, 10pt, 12pt, 18pt, 24pt, 48pt
	- Font size list configuration
		- **fontSizeOptions** or **font_size_options**
			- a string array
			- each string must include pt or px
		```javascript
			RichEditor.Init({
				...
				toolbar: ['fontSize'],
				fontSizeOptions: ['9pt', '24px']
				...
			});
		```
- **foreColor**
	- Change font color.
- **heading_style**
	- Heading styles (h1, h2, h3, ...)
- **hr**
	- Add a horizontal line in the editor.
- **indentation**
	- Indent/outdent a line.
	- Indentation size configuration
		- **indentationSize** or **indentation_size**
			- Default: 1rem(16px)
			- This must include rem or px.
		```javascript
			RichEditor.Init({
				...
				toolbar: ['indentation'],
				indentationSize: '3rem',
				...
			});
		```
- **info**
	- Show shortcuts.
- **italic**
	- Toggle a *italic* style.
- **redo**
	- Redo a history.
- **selectAll**
	- Select all texts in the editor.
- **strikethrough**
	- Toggle a <s>strike through</s> style.
- **subscript**
	- Toggle a <sub>sub script</sub> style.
- **superscript**
	- Toggle a <sup>super script</sup> style.
- **underline**
	- Toggle an <u>underline</u> style.
- **undo**
	- Undo a history.