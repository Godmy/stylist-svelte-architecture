import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';

/**
 * Change between two board states, as sent to or received from other
 * participants: new objects, full new versions of changed ones, removed ids.
 */
export type CanvasChange = {
	added: CanvasObject[];
	updated: CanvasObject[];
	removed: string[];
};
