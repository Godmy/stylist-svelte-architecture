export type SchemaField = {
	id: string;
	name: string;
	type: string;
	required: boolean;
	primary: boolean;
	unique: boolean;
	reference?: string;
	notes: readonly string[];
};
