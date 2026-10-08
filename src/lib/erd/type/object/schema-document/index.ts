import type { SchemaDependency } from '$stylist/erd/type/object/schema-dependency';
import type { SchemaTable } from '$stylist/erd/type/object/schema-table';

export type SchemaDocument = {
	tables: readonly SchemaTable[];
	dependencies: readonly SchemaDependency[];
};
