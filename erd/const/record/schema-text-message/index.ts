/** Parser messages shown by SchemaText and counted by Schema. */
export const ERD_SCHEMA_TEXT_MESSAGE = {
	en: {
		noTables: 'SQL parser did not find CREATE TABLE blocks.',
		closeBefore: 'Line {line}: close {table} before opening a new table.',
		strayBrace: 'Line {line}: closing brace without a table.',
		expectedBlock: 'Line {line}: expected a table block or dependency.',
		expectedField: 'Line {line}: expected "field type" with optional modifiers.',
		unclosed: 'Line {line}: {table} was not closed with "}".',
		conflict: 'Migrate conflict: table "{table}" already exists in Live.'
	},
	ru: {
		noTables: 'SQL-парсер не нашёл блоков CREATE TABLE.',
		closeBefore: 'Строка {line}: закройте {table}, прежде чем открывать новую таблицу.',
		strayBrace: 'Строка {line}: закрывающая скобка без таблицы.',
		expectedBlock: 'Строка {line}: ожидается блок таблицы или зависимость.',
		expectedField: 'Строка {line}: ожидается «поле тип» с необязательными модификаторами.',
		unclosed: 'Строка {line}: таблица {table} не закрыта символом «}».',
		conflict: 'Конфликт миграции: таблица «{table}» уже есть в текущей схеме.'
	}
} as const;
