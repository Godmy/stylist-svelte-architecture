/**
 * Pan and zoom of a canvas scene: a world point `p` is drawn at
 * `p * zoom + (x, y)` in canvas pixels.
 */
export type CanvasViewport = {
	x: number;
	y: number;
	zoom: number;
};
