/** Messages of SchemaHeader; the title prop overrides the heading. */
export const ERD_SCHEMA_HEADER_MESSAGE = {
	en: {
		title: 'Schema',
		tables: {
			one: '{count} table',
			other: '{count} tables'
		},
		relations: {
			one: '{count} relation',
			other: '{count} relations'
		},
		errors: {
			one: '{count} error',
			other: '{count} errors'
		},
		hint: "hover/click a table to trace its relations · drag a domain's label to move it"
	},
	ru: {
		title: 'Схема',
		tables: {
			one: '{count} таблица',
			few: '{count} таблицы',
			many: '{count} таблиц',
			other: '{count} таблицы'
		},
		relations: {
			one: '{count} связь',
			few: '{count} связи',
			many: '{count} связей',
			other: '{count} связи'
		},
		errors: {
			one: '{count} ошибка',
			few: '{count} ошибки',
			many: '{count} ошибок',
			other: '{count} ошибки'
		},
		hint: 'наведите или щёлкните таблицу, чтобы увидеть связи · перетащите подпись домена, чтобы сдвинуть его'
	}
} as const;
