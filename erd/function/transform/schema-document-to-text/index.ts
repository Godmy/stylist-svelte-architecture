import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';

function sanitizeTypeToken(type: string): string {
	const trimmed = type.trim();
	// The custom ERD DSL splits a field line on whitespace and treats every
	// token after the type as a modifier keyword -- a type with embedded
	// spaces (e.g. SQL's `ENUM('a', 'b')`) would otherwise get chopped into
	// bogus extra tokens on re-parse.
	return trimmed.length > 0 ? trimmed.replace(/\s+/g, '') : 'unknown';
}

/**
 * Inverse of schemaTextToDocument's custom-DSL branch: serializes a parsed
 * SchemaDocument back into the native ERD DSL text
 * (`table x { field type [pk] [unique] [required] [-> target.col] }`).
 *
 * Used to normalize documents parsed from other dialects (e.g. the SQL
 * branch, which never sets SchemaField.reference on individual fields --
 * foreign keys only show up in document.dependencies) into the same compact
 * inline-reference format the rest of the tool already produces.
 */
export function schemaDocumentToText(document: SchemaDocument): string {
	const referenceByFieldId = new Map(
		document.dependencies.map((dependency) => [
			`${dependency.sourceTable}.${dependency.sourceField}`,
			`${dependency.targetTable}.${dependency.targetField}`
		])
	);

	const lines: string[] = [];

	for (const table of document.tables) {
		lines.push(`table ${table.name} {`);

		for (const field of table.fields) {
			const tokens = [field.name, sanitizeTypeToken(field.type)];

			if (field.primary) {
				tokens.push('pk');
			} else {
				if (field.unique) {
					tokens.push('unique');
				}
				if (field.required) {
					tokens.push('required');
				}
			}

			const reference = field.reference ?? referenceByFieldId.get(field.id);
			if (reference) {
				tokens.push('->', reference);
			}

			lines.push(`  ${tokens.join(' ')}`);
		}

		lines.push('}');
		lines.push('');
	}

	return lines.join('\n').trim() + '\n';
}

export default schemaDocumentToText;
