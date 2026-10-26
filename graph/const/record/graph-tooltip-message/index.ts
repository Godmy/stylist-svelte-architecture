/** Messages of GraphTooltip. */
export const GRAPH_GRAPH_TOOLTIP_MESSAGE = {
	en: {
		deps: {
			one: '{count} dependency',
			other: '{count} deps'
		},
		more: '+{count} more',
		none: 'no dependencies'
	},
	ru: {
		deps: {
			one: '{count} зависимость',
			few: '{count} зависимости',
			many: '{count} зависимостей',
			other: '{count} зависимости'
		},
		more: 'ещё {count}',
		none: 'нет зависимостей'
	}
} as const;
