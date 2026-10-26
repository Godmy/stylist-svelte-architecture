/** Default texts of ZwickyScene; the title and text props override them. */
export const GRAPH_ZWICKY_SCENE_MESSAGE = {
	en: {
		title: 'Zwicky Graph',
		badge: 'WebGL2 · Instanced',
		nodes: 'nodes',
		edges: 'edges',
		render: 'render',
		selected: 'selected',
		dependencies: 'deps',
		clear: '✕ clear all filters',
		hint: 'Drag · Wheel · F fit · Click select · Pills filter'
	},
	ru: {
		title: 'Граф Цвикки',
		badge: 'WebGL2 · инстансинг',
		nodes: 'узлы',
		edges: 'связи',
		render: 'отрисовка',
		selected: 'выбрано',
		dependencies: 'завис.',
		clear: '✕ сбросить фильтры',
		hint: 'Перетаскивание · колесо · F — вписать · щелчок — выбор · плашки — фильтр'
	}
} as const;
