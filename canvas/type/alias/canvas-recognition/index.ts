import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { CanvasShapeKind } from '$stylist/canvas/type/alias/canvas-shape-kind';

/**
 * Figure recognized in a freehand stroke, in world coordinates: a straight
 * line, or a shape in a box. `vertices` (only for `polygon`) are corners
 * normalized to the box, `0..1` on each axis.
 */
export type CanvasRecognition =
	| { kind: 'line'; points: [Point2D, Point2D] }
	| {
			kind: 'shape';
			shape: CanvasShapeKind;
			x: number;
			y: number;
			width: number;
			height: number;
			vertices?: Point2D[];
	  };
