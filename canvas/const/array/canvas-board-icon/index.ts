import type { TokenIconName } from '$stylist/svg/type/alias/icon-name';

/** Icons offered by the icon tool of a shared canvas. */
export const CANVAS_BOARD_ICON = [
	'star',
	'heart',
	'smile',
	'thumbs-up',
	'check',
	'x',
	'flag',
	'lightbulb',
	'zap',
	'bell',
	'map-pin',
	'bookmark',
	'award',
	'gift',
	'user',
	'home',
	'message-circle',
	'calendar',
	'clock',
	'camera',
	'globe',
	'link',
	'code',
	'server'
] as const satisfies readonly TokenIconName[];
