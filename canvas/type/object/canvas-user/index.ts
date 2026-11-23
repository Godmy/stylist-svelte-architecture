import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';

/** Participant of a collaborative canvas or editor. */
export type CanvasUser = {
	id: string;
	name: string;
	/** CSS color of the user's cursor and swatch. */
	color: string;
	avatar?: string;
	/** Last known cursor position on the canvas, in canvas pixels. */
	cursorPosition?: Point2D;
};
