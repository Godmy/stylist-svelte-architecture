import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';

/** Freehand stroke of a drawing surface; an eraser stroke removes pixels under it. */
export type CanvasStroke = {
	id: string;
	tool: 'pen' | 'eraser';
	color: string;
	width: number;
	points: Point2D[];
};
