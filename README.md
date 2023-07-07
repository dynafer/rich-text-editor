# Rich Text Editor

## Preparation
- ### Node.js
- ### Yarn

## Begin
```bash
$ yarn install
$ yarn run build
or
$ yarn run watch
```

### 1. Add a script tag.
```html
<script src="/path/to/editor.min.js"></script>
```

### 2. Setup an editor.
```javascript
RichEditor.Init({
	selector: document.getElementById('editor'),
	// Other Settings
}).then(editor => {
	// After the editor has fully loaded
});
```

## Configuration
- All configuration can be written camel case or snake case.
	- camelCase
	- snake_case
- **selector**
	- Required
	- HTMLElement
- **mode**
	- Optional
	- Default: classic
	- Available: classic, inline
	- Inline: When you scroll until the toolbar disappears from the screen, the toolbar will appear attached to the top of the screen.
	- You can check the modes with example files in ***example/mode*** folder.
- **skin**
	- Optional
	- Default: simple
	- Available: simple, dark, bootstrap
	- You can check the skins with example files in ***example/skin*** folder.
- **language**
	- Optional
	- Default: en-GB
	- If you want to add other languages, check the language file in **example/editor/langs** folder.
- **plugins**
	- Optional
	- Default: []
	- [Go to check the file.](https://github.com/dynafer/rich-text-editor/example/plugins/README.md)
- **toolbar**
	- Optional
	- Default: []
	- [Go to check the file.](https://github.com/dynafer/rich-text-editor/example/toolbar/README.md)
- **resizable**
	- Optional
	- Default: vertical
	- Available: horizontal, vertical, all
	- You can check the skins with example files in ***example/resizable*** folder.

## License
[MIT](https://github.com/dynafer/rich-text-editor/blob/main/LICENSE.txt)