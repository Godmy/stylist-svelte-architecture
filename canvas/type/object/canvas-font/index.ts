import type { CanvasFontFamily } from '$stylist/canvas/type/alias/canvas-font-family';

/** Typography of a text-bearing canvas object; missing fields use the board defaults. */
export type CanvasFont = {
	family?: CanvasFontFamily;
	/** Font size in world pixels. */
	size?: number;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	align?: 'left' | 'center' | 'right';
};
