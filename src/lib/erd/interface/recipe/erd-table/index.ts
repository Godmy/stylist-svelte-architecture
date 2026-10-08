import type { SchemaTable } from '$stylist/erd/type/object/schema-table';
export interface RecipeErdTable {
	table: SchemaTable;
	active?: boolean;
	dimmed?: boolean;
	relatedFieldIds?: readonly string[];
}
