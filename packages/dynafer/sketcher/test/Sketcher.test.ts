import { Sketcher } from '../ts/Sketcher';

const TestSketcher = () =>
	describe('@dynafer/sketcher/Sketcher', () => {
		it('should create a DOMFactory with the given settings', () => {
			const sketch = Sketcher.SketchOne({
				TagName: 'div',
				Elements: [
					Sketcher.SketchOne({
						TagName: 'p',
						Elements: ['Hello, world!'],
					}),
				],
				Attributes: { id: 'main', },
				Classes: ['container'],
			});

			expect(sketch.Self.tagName).toBe('DIV');
			expect(sketch.Self.childNodes.length).toBe(1);
			expect(sketch.GetChildren()[0].Self.tagName).toBe('P');
			expect(sketch.GetChildren()[0].Self.textContent).toBe('Hello, world!');
			expect(sketch.Self.getAttribute('id')).toBe('main');
			expect(sketch.Self.classList.contains('container')).toBe(true);
		});

		it('should create multiple DOMFactories with the given settings', () => {
			const sketches = Sketcher.Sketch([
				{
					TagName: 'div',
					Classes: ['container'],
				},
				{
					TagName: 'p',
					Elements: ['Hello, world!'],
				},
			]);

			expect(sketches.length).toBe(2);
			expect(sketches[0].Self.tagName).toBe('DIV');
			expect(sketches[0].Self.classList.contains('container')).toBe(true);
			expect(sketches[1].Self.tagName).toBe('P');
			expect(sketches[1].Self.textContent).toBe('Hello, world!');
		});
	});

export default TestSketcher;