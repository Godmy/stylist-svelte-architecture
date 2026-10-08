import type { SchemaField } from '$stylist/erd/type/object/schema-field';

export type SchemaTable = {
	id: string;
	name: string;
	fields: readonly SchemaField[];
};
