import { DOMFactory } from '../ts/Sketcher';

const TestDOMFactory = () =>
	describe('@dynafer/sketcher/DOMFactory', () => {
		let factory: DOMFactory;

		beforeEach(() => {
			factory = new DOMFactory('div');
		});

		afterEach(() => factory.Destroy());

		it('creates a new div element by default', () => expect(factory.Self.tagName).toBe('DIV'));

		it('adds and removes a class to an element', () => {
			factory.AddClass('test-class');
			expect(factory.HasClass('test-class')).toBe(true);
			factory.RemoveClass('test-class');
			expect(factory.HasClass('test-class')).toBe(false);
		});

		it('binds and unbinds an event listener to an element', () => {
			const eventListener = jest.fn();
			factory.Bind('click', eventListener);
			factory.Dispatch('click');
			expect(eventListener).toHaveBeenCalledTimes(1);
			factory.Unbind('click', eventListener);
			factory.Dispatch('click');
			expect(eventListener).toHaveBeenCalledTimes(1);
		});

		it('inserts child elements', () => {
			const childFactory1 = new DOMFactory('span');
			const childFactory2 = new DOMFactory('span');
			factory.Insert(childFactory1, childFactory2);
			expect(factory.GetChildren().length).toBe(2);
		});

		it('finds a factory given an element', () => {
			const childFactory = new DOMFactory('div');
			factory.Insert(childFactory);
			expect(DOMFactory.FindFactory(childFactory.Self)).toBe(childFactory);
		});

		it('destroys a factory and its children', () => {
			const childFactory = new DOMFactory('div');
			const childFactory1 = new DOMFactory('span');
			const childFactory2 = new DOMFactory('span');
			childFactory.Insert(childFactory1, childFactory2);
			factory.Insert(childFactory);
			childFactory.Destroy();
			expect(factory.GetChildren().length).toBe(0);
		});
	});

export default TestDOMFactory;