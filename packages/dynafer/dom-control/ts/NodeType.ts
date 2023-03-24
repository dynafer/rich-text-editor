enum ENodeTypeMap {
	UNKNOWN = 0,
	ELEMENT = 1,
	ATTRIBUTE = 2,
	TEXT = 3,
	CDATA_SECTION = 4,
	ENTITY_REFERENCE = 5,
	ENTITY = 6,
	PROCESSING_INSTRUCTION = 7,
	COMMENT = 8,
	DOCUMENT = 9,
	DOCUMENT_TYPE = 10,
	DOCUMENT_FRAGMENT = 11,
	NOTATION = 12,
}

const getNodeType = (value: unknown): number => Object.assign(value ?? {})?.nodeType ?? ENodeTypeMap.UNKNOWN;

const is = <T>(type: ENodeTypeMap) => (value: unknown): value is T => getNodeType(value) === type;

export const IsNode = (value: unknown): value is Node => getNodeType(value) !== ENodeTypeMap.UNKNOWN;
export const IsElement: (value: unknown) => value is Element = is(ENodeTypeMap.ELEMENT);
export const IsAttribute: (value: unknown) => value is Attr = is(ENodeTypeMap.ATTRIBUTE);
export const IsText: (value: unknown) => value is Text = is(ENodeTypeMap.TEXT);
export const IsCDATASection: (value: unknown) => value is CDATASection = is(ENodeTypeMap.CDATA_SECTION);
export const IsEntityReference: (value: unknown) => value is Node = is(ENodeTypeMap.ENTITY_REFERENCE);
export const IsEntity: (value: unknown) => value is Node = is(ENodeTypeMap.ENTITY);
export const IsProcessingInstruction: (value: unknown) => value is ProcessingInstruction = is(ENodeTypeMap.PROCESSING_INSTRUCTION);
export const IsComment: (value: unknown) => value is Comment = is(ENodeTypeMap.COMMENT);
export const IsDocument: (value: unknown) => value is Document = is(ENodeTypeMap.DOCUMENT);
export const IsDocumentType: (value: unknown) => value is DocumentType = is(ENodeTypeMap.DOCUMENT_TYPE);
export const IsDocumentFragment: (value: unknown) => value is DocumentFragment = is(ENodeTypeMap.DOCUMENT_FRAGMENT);
export const IsNotation: (value: unknown) => value is Node = is(ENodeTypeMap.NOTATION);