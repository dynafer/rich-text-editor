import * as Inserter from '../ts/Inserter';

const TestInserter = () =>
	describe('@dynafer/dom-control/Inserter', () => {
		let parent: HTMLElement;
		let child: HTMLElement;

		beforeEach(() => {
			// Create a new parent and child element before each test
			parent = document.createElement('div');
			child = document.createElement('span');
		});

		it('should insert HTML before the inner content of an element with BeforeInner()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.BeforeInner(parent, '<span>World</span>');
			expect(parent.innerHTML).toBe('<span>World</span><p>Hello</p>');
		});

		it('should insert an element before the inner content of an element with BeforeInner()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.BeforeInner(parent, child);
			expect(parent.innerHTML).toBe('<span></span><p>Hello</p>');
		});

		it('should insert multiple elements before the inner content of an element with BeforeInner()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.BeforeInner(parent, '<span>World</span>', child);
			expect(parent.innerHTML).toBe('<span>World</span><span></span><p>Hello</p>');
		});

		it('should insert HTML after the inner content of an element with AfterInner()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.AfterInner(parent, '<span>World</span>');
			expect(parent.innerHTML).toBe('<p>Hello</p><span>World</span>');
		});

		it('should insert an element after the inner content of an element with AfterInner()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.AfterInner(parent, child);
			expect(parent.innerHTML).toBe('<p>Hello</p><span></span>');
		});

		it('should insert multiple elements after the inner content of an element with AfterInner()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.AfterInner(parent, '<span>World</span>', child);
			expect(parent.innerHTML).toBe('<p>Hello</p><span>World</span><span></span>');
		});

		it('should insert HTML before an element with BeforeOuter()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.BeforeOuter(parent.firstChild, '<span>World</span>');
			expect(parent.innerHTML).toBe('<span>World</span><p>Hello</p>');
		});

		it('should insert an element before an element with BeforeOuter()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.BeforeOuter(parent.firstChild, child);
			expect(parent.innerHTML).toBe('<span></span><p>Hello</p>');
		});

		it('should insert multiple elements before an element with BeforeOuter()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.BeforeOuter(parent.firstChild, '<span>World</span>', child);
			expect(parent.innerHTML).toBe('<span>World</span><span></span><p>Hello</p>');
		});

		it('should insert HTML after an element with AfterOuter()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.AfterOuter(parent.firstChild, '<span>World</span>');
			expect(parent.innerHTML).toBe('<p>Hello</p><span>World</span>');
		});

		it('should insert an element after an element with AfterOuter()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.AfterOuter(parent.firstChild, child);
			expect(parent.innerHTML).toBe('<p>Hello</p><span></span>');
		});

		it('should insert multiple elements after an element with AfterOuter()', () => {
			parent.innerHTML = '<p>Hello</p>';
			Inserter.AfterOuter(parent.firstChild, '<span>World</span>', child);
			expect(parent.innerHTML).toBe('<p>Hello</p><span></span><span>World</span>');
		});

		it('should do nothing when given an invalid selector with BeforeInner()', () => {
			Inserter.BeforeInner(null, '<span>World</span>');
			expect(parent.innerHTML).toBe('');
		});

		it('should do nothing when given an invalid selector with AfterInner()', () => {
			Inserter.AfterInner(null, '<span>World</span>');
			expect(parent.innerHTML).toBe('');
		});

		it('should do nothing when given an invalid selector with BeforeOuter()', () => {
			Inserter.BeforeOuter(null, '<span>World</span>');
			expect(parent.innerHTML).toBe('');
		});

		it('should do nothing when given an invalid selector with AfterOuter()', () => {
			Inserter.AfterOuter(null, '<span>World</span>');
			expect(parent.innerHTML).toBe('');
		});
	});

export default TestInserter;