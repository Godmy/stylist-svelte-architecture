/**
 * Stroke glyphs (SVG path data, 24x24 viewBox, `stroke="currentColor"`) of the
 * SharedCanvas toolbar and actions, keyed by tool id or action name. Drawn
 * inline because the shared icon set has no whiteboard-specific shapes.
 */
export const CANVAS_BOARD_GLYPH = {
	select: 'M5 3l13 8.5-6 1.2-2.8 5.8z',
	hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5M14 10.5V5.5a1.5 1.5 0 0 1 3 0V12M17 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3.4 13.2a1.5 1.5 0 0 1 2.5-1.6L8 14.5',
	text: 'M5 7V4h14v3M12 4v16M9 20h6',
	sticky: 'M4 4h16v10l-6 6H4zM14 20v-6h6',
	pen: 'M4 20l1.4-4.6L16 4.8a2.1 2.1 0 0 1 3 3L8.4 18.6zM14 6.8l3.2 3.2',
	magic: 'M4 20L14.5 9.5M12.5 7.5l4 4M15 3v3M19.5 4.5l-2 2M21 9h-3M9 4.5l1.5 1.5',
	line: 'M5 19L19 5',
	arrow: 'M5 19L19 5M10 5h9v9',
	frame: 'M7 3v18M17 3v18M3 7h18M3 17h18',
	image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01',
	lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
	unlock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 6.7-1.4',
	eraser:
		'M8 20h12M5.6 13.4l7-7a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L12 19H8.6l-3-3a1.8 1.8 0 0 1 0-2.6zM9.6 9.4l5 5',
	undo: 'M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
	redo: 'M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
	zoomIn: 'M12 5v14M5 12h14',
	zoomOut: 'M5 12h14',
	fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
	export: 'M12 4v11M7 10l5 5 5-5M5 20h14',
	import: 'M12 15V4M7 9l5-5 5 5M5 20h14',
	duplicate: 'M8 8h12v12H8zM16 8V4H4v12h4',
	front: 'M12 19V5M6 11l6-6 6 6',
	back: 'M12 5v14M6 13l6 6 6-6',
	delete: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'
} as const;
