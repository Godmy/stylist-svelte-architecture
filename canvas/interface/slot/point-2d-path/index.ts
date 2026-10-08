import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';

export interface ObjectPoint2DPath {
	path: string;
	length: number;
	midPoint: Point2D;
	angle: number;
}
