import TestArray from './Array.test';
import TestFormula from './Formula.test';
import TestObject from './Object.test';
import TestString from './String.test';
import TestType from './Type.test';
import TestUID from './UID.test';

describe('@dynafer/utils', () => {
	TestArray();
	TestFormula();
	TestObject();
	TestString();
	TestType();
	TestUID();
});