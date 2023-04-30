import * as Style from '../ts/Style';

const TestStyle = () =>
	describe('@dynafer/dom-control/Style', () => {

		const div = document.createElement('div');

		beforeEach(() => {
			div.style.cssText = '';
		});

		describe('GetAsMap', () =>
			it('should return a dictionary of styles for the given div', () => {
				div.style.color = 'red';
				div.style.backgroundColor = 'blue';
				const styleDict = Style.GetAsMap(div);
				expect(styleDict).toEqual({ color: 'red', backgroundColor: 'blue' });
			})
		);

		describe('Get', () => {
			it('should return the value of the style property for the given div', () => {
				div.style.color = 'red';
				const color = Style.Get(div, 'color');
				expect(color).toBe('red');
			});

			it('should return the computed value of the style property if bComputed is true', () => {
				div.style.width = '100px';
				const width = Style.Get(div, 'width', true);
				expect(width).toBe('100px');
			});
		});

		describe('GetText', () =>
			it('should return the cssText of the style property for the given div', () => {
				div.style.color = 'red';
				const cssText = Style.GetText(div);
				expect(cssText).toBe('color: red;');
			})
		);

		describe('Set', () =>
			it('should override an existing style property for the given div', () => {
				div.style.color = 'red';
				Style.Set(div, 'color', 'blue');
				expect(div.style.color).toBe('blue');
			})
		);

		describe('SetText', () => {
			it('should remove the style property if the style text is empty', () => {
				div.style.color = 'red';
				Style.SetText(div, '');
				expect(div.style.cssText).toBe('');
			});

			it('should set the cssText of the style property for the given div', () => {
				Style.SetText(div, 'color: red;');
				expect(div.style.color).toBe('red');
			});
		});

		describe('Remove', () => {
			it('should remove a style property for the given div', () => {
				div.style.color = 'red';
				Style.Remove(div, 'color');
				expect(div.style.color).toBe('');
			});

			it('should remove the style property from the cssText if it exists', () => {
				div.style.color = 'red';
				div.style.backgroundColor = 'blue';
				Style.Remove(div, 'color');
				expect(div.style.cssText).toBe('background-color: blue;');
			});

			it('should remove the style property and the style property from the cssText if it is the only property', () => {
				div.style.color = 'red';
				Style.Remove(div, 'color');
				expect(div.style.cssText).toBe('');
			});
		});

		describe('RemoveMultiple', () =>
			it('should remove multiple style properties for the given div', () => {
				div.style.color = 'red';
				div.style.backgroundColor = 'blue';
				Style.RemoveMultiple(div, 'color', 'background-color');
				expect(div.style.color).toBe('');
				expect(div.style.backgroundColor).toBe('');
			})
		);

		describe('Has', () => {
			it('should return true if the style property exists for the given div', () => {
				div.style.color = 'red';
				expect(Style.Has(div, 'color')).toBe(true);
			});

			it('should return false if the style property does not exist for the given div', () => {
				expect(Style.Has(div, 'color')).toBe(false);
			});

			it('should return true if the style property exists and its value matches compareValue', () => {
				div.style.color = 'red';
				expect(Style.Has(div, 'color', 'red')).toBe(true);
			});

			it('should return false if the style property exists but its value does not match compareValue', () => {
				div.style.color = 'red';
				expect(Style.Has(div, 'color', 'blue')).toBe(false);
			});
		});
	});

export default TestStyle;