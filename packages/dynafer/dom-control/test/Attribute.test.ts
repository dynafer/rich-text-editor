import * as Attribute from '../ts/Attribute';

const TestAttribute = () =>
	describe('@dynafer/dom-control/Attribute', () => {
		let element: HTMLElement;

		beforeEach(() => {
			// Create a new div element before each test
			element = document.createElement('div');
		});

		it('should set a single attribute on an element with Set()', () => {
			Attribute.Set(element, 'data-id', '123');
			expect(element.getAttribute('data-id')).toBe('123');
		});

		it('should set multiple attributes on an element with SetMultiple()', () => {
			Attribute.SetMultiple(element, { 'data-id': '123', class: 'button' });
			expect(element.getAttribute('data-id')).toBe('123');
			expect(element.getAttribute('class')).toBe('button');
		});

		it('should get the value of an attribute with Get()', () => {
			element.setAttribute('data-id', '123');
			expect(Attribute.Get(element, 'data-id')).toBe('123');
		});

		it('should return null if an attribute does not exist with Get()', () => expect(Attribute.Get(element, 'data-id')).toBeNull());

		it('should return true if an element has an attribute with a specific value with Has()', () => {
			element.setAttribute('data-id', '123');
			expect(Attribute.Has(element, 'data-id', '123')).toBe(true);
		});

		it('should return false if an element does not have an attribute with a specific value with Has()', () => {
			element.setAttribute('data-id', '123');
			expect(Attribute.Has(element, 'data-id', '456')).toBe(false);
		});

		it('should remove an attribute from an element with Remove()', () => {
			element.setAttribute('data-id', '123');
			Attribute.Remove(element, 'data-id');
			expect(element.hasAttribute('data-id')).toBe(false);
		});

		it('should remove multiple attributes from an element with RemoveMultiple()', () => {
			element.setAttribute('data-id', '123');
			element.setAttribute('class', 'button');
			Attribute.RemoveMultiple(element, ['data-id', 'class']);
			expect(element.hasAttribute('data-id')).toBe(false);
			expect(element.hasAttribute('class')).toBe(false);
		});
	});

export default TestAttribute;