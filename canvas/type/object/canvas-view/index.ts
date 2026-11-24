import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';

/**
 * What a participant looks at, independent of their screen size: the world
 * point in the middle of the board and the zoom. Used to follow the teacher.
 */
export type CanvasView = {
	center: Point2D;
	zoom: number;
};
