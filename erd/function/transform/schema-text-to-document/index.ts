import type { SchemaDependency } from '$stylist/erd/type/object/schema-dependency';
import type { SchemaField } from '$stylist/erd/type/object/schema-field';
import type { SchemaParseResult } from '$stylist/erd/type/object/schema-parse-result';
import type { SchemaTable } from '$stylist/erd/type/object/schema-table';

export function schemaTextToDocument(source: string): SchemaParseResult {
	function normalizeId(value: string): string {
		return value
			.trim()
			.replace(/^`|`$/g, '')
			.toLowerCase()
			.replace(/[^\w-]+/g, '-');
	}

	function createDependency(
		sourceTable: string,
		sourceField: string,
		targetTable: string,
		targetField: string
	): SchemaDependency {
		return {
			id: `${normalizeId(sourceTable)}.${normalizeId(sourceField)}--${normalizeId(targetTable)}.${normalizeId(targetField)}`,
			sourceTable: normalizeId(sourceTable),
			sourceField: normalizeId(sourceField),
			targetTable: normalizeId(targetTable),
			targetField: normalizeId(targetField),
			label: `${sourceTable}.${sourceField} -> ${targetTable}.${targetField}`
		};
	}

	function parseField(line: string, tableName: string): SchemaField | null {
		const tokens = line.replace(/[,;]$/, '').split(/\s+/).filter(Boolean);
		const name = tokens.shift();
		const type = tokens.shift();

		if (!name || !type) {
			return null;
		}

		const referenceIndex = tokens.indexOf('->');
		const referenceCandidate = referenceIndex >= 0 ? tokens[referenceIndex + 1] : undefined;
		const reference = referenceCandidate?.includes('.') ? referenceCandidate : undefined;
		const notes = tokens.filter(
			(token, index) => index !== referenceIndex && index !== referenceIndex + 1
		);

		return {
			id: `${normalizeId(tableName)}.${normalizeId(name)}`,
			name,
			type,
			required: notes.some((token) =>
				['required', 'not-null', 'notnull'].includes(token.toLowerCase())
			),
			primary: notes.some((token) =>
				['pk', 'primary', 'primary-key'].includes(token.toLowerCase())
			),
			unique: notes.some((token) => token.toLowerCase() === 'unique'),
			reference,
			notes
		};
	}

	function uniqueDependencies(dependencies: readonly SchemaDependency[]): SchemaDependency[] {
		return Array.from(
			new Map(dependencies.map((dependency) => [dependency.id, dependency])).values()
		);
	}

	function stripSqlComments(value: string): string {
		return value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');
	}

	function splitTopLevel(value: string, separator: string): string[] {
		const parts: string[] = [];
		let current = '';
		let depth = 0;
		let quote: string | null = null;

		for (const char of value) {
			if (quote) {
				current += char;
				if (char === quote) {
					quote = null;
				}
				continue;
			}

			if (char === "'" || char === '"' || char === '`') {
				quote = char;
				current += char;
				continue;
			}

			if (char === '(') {
				depth += 1;
			}

			if (char === ')') {
				depth = Math.max(0, depth - 1);
			}

			if (char === separator && depth === 0) {
				parts.push(current.trim());
				current = '';
				continue;
			}

			current += char;
		}

		if (current.trim()) {
			parts.push(current.trim());
		}

		return parts;
	}

	function findSqlTableBlocks(value: string): { name: string; body: string }[] {
		const blocks: { name: string; body: string }[] = [];
		const tablePattern = /create\s+table\s+(?:if\s+not\s+exists\s+)?`?([\w]+)`?\s*\(/gi;
		let match: RegExpExecArray | null;

		while ((match = tablePattern.exec(value))) {
			let depth = 1;
			let quote: string | null = null;
			let cursor = tablePattern.lastIndex;

			for (; cursor < value.length; cursor += 1) {
				const char = value[cursor];

				if (quote) {
					if (char === quote) {
						quote = null;
					}
					continue;
				}

				if (char === "'" || char === '"' || char === '`') {
					quote = char;
					continue;
				}

				if (char === '(') {
					depth += 1;
					continue;
				}

				if (char === ')') {
					depth -= 1;
					if (depth === 0) {
						blocks.push({
							name: match[1],
							body: value.slice(tablePattern.lastIndex, cursor)
						});
						tablePattern.lastIndex = cursor + 1;
						break;
					}
				}
			}
		}

		return blocks;
	}

	function parseSqlType(tokens: readonly string[]): string {
		const collected: string[] = [];

		for (const token of tokens) {
			if (
				[
					'primary',
					'not',
					'null',
					'unique',
					'default',
					'auto_increment',
					'generated',
					'stored',
					'comment',
					'check',
					'references',
					'constraint',
					'collate',
					'character'
				].includes(token.toLowerCase())
			) {
				break;
			}

			collected.push(token);
		}

		return collected.join(' ') || 'unknown';
	}

	function parseSqlField(
		entry: string,
		tableName: string
	): { field: SchemaField; dependency?: SchemaDependency } | null {
		const fieldMatch = entry.match(/^`?([\w]+)`?\s+(.+)$/s);
		if (!fieldMatch) {
			return null;
		}

		const name = fieldMatch[1];
		const rest = fieldMatch[2].replace(/\s+/g, ' ').trim();
		const lowerRest = rest.toLowerCase();
		const tokens = rest.split(/\s+/);
		const inlineReferenceMatch = rest.match(
			/\breferences\s+`?([\w]+)`?\s*\(\s*`?([\w]+)`?\s*\)/i
		);
		const reference = inlineReferenceMatch
			? `${inlineReferenceMatch[1]}.${inlineReferenceMatch[2]}`
			: undefined;

		return {
			field: {
				id: `${normalizeId(tableName)}.${normalizeId(name)}`,
				name,
				type: parseSqlType(tokens),
				required: /\bnot\s+null\b/i.test(rest),
				primary: /\bprimary\s+key\b/i.test(rest),
				unique: /\bunique\b/i.test(rest),
				reference,
				notes: [
					...(lowerRest.includes('auto_increment') ? ['auto_increment'] : []),
					...(lowerRest.includes('default') ? ['default'] : [])
				]
			},
			dependency: inlineReferenceMatch
				? createDependency(
						tableName,
						name,
						inlineReferenceMatch[1],
						inlineReferenceMatch[2]
					)
				: undefined
		};
	}

	function parseSqlDocument(value: string): SchemaParseResult {
		const cleanedSource = stripSqlComments(value);
		const tables: SchemaTable[] = [];
		const dependencies: SchemaDependency[] = [];
		const errors: string[] = [];

		for (const block of findSqlTableBlocks(cleanedSource)) {
			const fields: SchemaField[] = [];
			const entries = splitTopLevel(block.body, ',');

			for (const entry of entries) {
				const normalizedEntry = entry.replace(/\s+/g, ' ').trim();
				const foreignKeyMatch = normalizedEntry.match(
					/(?:constraint\s+`?[\w]+`?\s+)?foreign\s+key\s*\(\s*`?([\w]+)`?\s*\)\s+references\s+`?([\w]+)`?\s*\(\s*`?([\w]+)`?\s*\)/i
				);

				if (foreignKeyMatch) {
					dependencies.push(
						createDependency(block.name, foreignKeyMatch[1], foreignKeyMatch[2], foreignKeyMatch[3])
					);
					continue;
				}

				if (
					/^(constraint|primary\s+key|unique\s+key|key|index|check)\b/i.test(normalizedEntry) ||
					/^unique\s*\(/i.test(normalizedEntry)
				) {
					continue;
				}

				const parsedField = parseSqlField(normalizedEntry, block.name);
				if (parsedField) {
					fields.push(parsedField.field);

					if (parsedField.dependency) {
						dependencies.push(parsedField.dependency);
					}
				}
			}

			tables.push({
				id: normalizeId(block.name),
				name: block.name,
				fields
			});
		}

		if (tables.length === 0) {
			errors.push('SQL parser did not find CREATE TABLE blocks.');
		}

		return {
			document: {
				tables,
				dependencies: uniqueDependencies(dependencies)
			},
			errors
		};
	}

	if (/create\s+table/i.test(source)) {
		return parseSqlDocument(source);
	}

	const tables: SchemaTable[] = [];
	const dependencies: SchemaDependency[] = [];
	const errors: string[] = [];
	const lines = source.split(/\r?\n/);
	let currentTable: { id: string; name: string; fields: SchemaField[] } | null = null;

	for (const [index, rawLine] of lines.entries()) {
		const lineNumber = index + 1;
		const line = rawLine.replace(/(#|\/\/).*$/, '').trim();

		if (!line) {
			continue;
		}

		const tableMatch = line.match(/^(?:table\s+)?([A-Za-z][\w-]*)\s*\{\s*$/);
		if (tableMatch) {
			if (currentTable) {
				errors.push(`Line ${lineNumber}: close ${currentTable.name} before opening a new table.`);
				continue;
			}

			currentTable = {
				id: normalizeId(tableMatch[1]),
				name: tableMatch[1],
				fields: []
			};
			continue;
		}

		if (line === '}') {
			if (!currentTable) {
				errors.push(`Line ${lineNumber}: closing brace without a table.`);
				continue;
			}

			tables.push(currentTable);
			currentTable = null;
			continue;
		}

		const dependencyMatch = line.match(/^([\w-]+)\.([\w-]+)\s*->\s*([\w-]+)\.([\w-]+)$/);
		if (dependencyMatch) {
			dependencies.push(
				createDependency(
					dependencyMatch[1],
					dependencyMatch[2],
					dependencyMatch[3],
					dependencyMatch[4]
				)
			);
			continue;
		}

		if (!currentTable) {
			errors.push(`Line ${lineNumber}: expected a table block or dependency.`);
			continue;
		}

		const field = parseField(line, currentTable.name);
		if (!field) {
			errors.push(`Line ${lineNumber}: expected "field type" with optional modifiers.`);
			continue;
		}

		currentTable.fields.push(field);

		if (field.reference) {
			const [targetTable, targetField] = field.reference.split('.');
			dependencies.push(createDependency(currentTable.name, field.name, targetTable, targetField));
		}
	}

	if (currentTable) {
		tables.push(currentTable);
		errors.push(`Line ${lines.length}: ${currentTable.name} was not closed with "}".`);
	}

	return {
		document: {
			tables,
			dependencies: uniqueDependencies(dependencies)
		},
		errors
	};
}
