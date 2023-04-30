import TestAttribute from './Attribute.test';
import TestInserter from './Inserter.test';
import TestNodeType from './NodeType.test';
import TestStyle from './Style.test';

describe('@dynafer/dom-control', () => {
	TestAttribute();
	TestInserter();
	TestNodeType();
	TestStyle();
});