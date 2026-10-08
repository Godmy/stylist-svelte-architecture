export type SchemaDependency = {
	id: string;
	sourceTable: string;
	sourceField: string;
	targetTable: string;
	targetField: string;
	label: string;
};
