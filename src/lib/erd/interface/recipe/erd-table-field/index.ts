import type { SchemaField } from '$stylist/erd/type/object/schema-field';
export interface RecipeErdTableField {
	field: SchemaField;
	active?: boolean;
	related?: boolean;
}
