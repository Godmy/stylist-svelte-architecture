import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';

export type SchemaParseResult = {
	document: SchemaDocument;
	errors: readonly string[];
};
