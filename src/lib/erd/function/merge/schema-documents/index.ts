import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';
import type { SchemaParseResult } from '$stylist/erd/type/object/schema-parse-result';

export function mergeSchemaDocuments(
	liveDocument: SchemaDocument,
	candidateDocument: SchemaDocument
): SchemaParseResult {
	const liveTableIds = new Set(liveDocument.tables.map((table) => table.id));
	const candidateTableIds = new Set(candidateDocument.tables.map((table) => table.id));
	const dependencyIds = new Set<string>();
	const errors: string[] = [];

	const candidateTables = candidateDocument.tables.filter((table) => {
		if (liveTableIds.has(table.id)) {
			errors.push(`Migrate conflict: table "${table.name}" already exists in Live.`);
			return false;
		}

		return true;
	});

	for (const table of liveDocument.tables) {
		candidateTableIds.delete(table.id);
	}

	return {
		document: {
			tables: [...liveDocument.tables, ...candidateTables],
			dependencies: [...liveDocument.dependencies, ...candidateDocument.dependencies].filter(
				(dependency) => {
					if (dependencyIds.has(dependency.id)) {
						return false;
					}

					dependencyIds.add(dependency.id);
					return true;
				}
			)
		},
		errors
	};
}
