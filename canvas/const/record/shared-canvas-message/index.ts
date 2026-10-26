/** Messages of SharedCanvas, tool names keyed by tool id. */
export const CANVAS_SHARED_CANVAS_MESSAGE = {
	en: {
		select: 'Select Tool',
		rectangle: 'Rectangle Tool',
		circle: 'Circle Tool',
		text: 'Text Tool',
		color: 'Select color',
		undo: 'Undo',
		redo: 'Redo',
		delete: 'Delete Selected',
		export: 'Export Canvas',
		cursor: 'Cursor of {name}',
		collaborators: 'Collaborators',
		you: '(You)'
	},
	ru: {
		select: 'Выделение',
		rectangle: 'Прямоугольник',
		circle: 'Круг',
		text: 'Текст',
		color: 'Выбрать цвет',
		undo: 'Отменить',
		redo: 'Повторить',
		delete: 'Удалить выбранное',
		export: 'Экспортировать холст',
		cursor: 'Курсор: {name}',
		collaborators: 'Участники',
		you: '(вы)'
	}
} as const;
