import * as NodeType from '../ts/NodeType';

const TestNodeType = () =>
	describe('@dynafer/dom-control/NodeType', () => {
		it('should correctly identify a window with IsWindow()', () => {
			expect(NodeType.IsWindow(window)).toBe(true);
			expect(NodeType.IsWindow(document)).toBe(false);
		});

		it('should correctly identify a node with IsNode()', () => {
			expect(NodeType.IsNode(document)).toBe(true);
			expect(NodeType.IsNode(window)).toBe(false);
		});

		it('should correctly identify an element with IsElement()', () => {
			const el = document.createElement('div');
			expect(NodeType.IsElement(el)).toBe(true);
			expect(NodeType.IsElement(document)).toBe(false);
		});

		it('should correctly identify an attribute with IsAttribute()', () => {
			const el = document.createElement('div');
			el.setAttribute('foo', 'bar');
			const attr = el.getAttributeNode('foo');
			expect(NodeType.IsAttribute(attr)).toBe(true);
			expect(NodeType.IsAttribute(el)).toBe(false);
		});

		it('should correctly identify a text node with IsText()', () => {
			const text = document.createTextNode('foo');
			expect(NodeType.IsText(text)).toBe(true);
			expect(NodeType.IsText(document)).toBe(false);
		});

		it('should correctly identify a processing instruction with IsProcessingInstruction()', () => {
			const pi = document.createProcessingInstruction('xml', 'version="1.0"');
			expect(NodeType.IsProcessingInstruction(pi)).toBe(true);
			expect(NodeType.IsProcessingInstruction(document)).toBe(false);
		});

		it('should correctly identify a comment with IsComment()', () => {
			const comment = document.createComment('foo');
			expect(NodeType.IsComment(comment)).toBe(true);
			expect(NodeType.IsComment(document)).toBe(false);
		});

		it('should correctly identify a document with IsDocument()', () => {
			expect(NodeType.IsDocument(document)).toBe(true);
			expect(NodeType.IsDocument(window)).toBe(false);
		});

		it('should correctly identify a document type with IsDocumentType()', () => {
			const doctype = document.implementation.createDocumentType('html', '', '');
			expect(NodeType.IsDocumentType(doctype)).toBe(true);
			expect(NodeType.IsDocumentType(document)).toBe(false);
		});

		it('should correctly identify a document fragment with IsDocumentFragment()', () => {
			const fragment = document.createDocumentFragment();
			expect(NodeType.IsDocumentFragment(fragment)).toBe(true);
			expect(NodeType.IsDocumentFragment(document)).toBe(false);
		});
	});

export default TestNodeType;