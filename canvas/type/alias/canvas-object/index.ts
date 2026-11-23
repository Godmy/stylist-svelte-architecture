import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SlotCanvasObject } from '$stylist/canvas/interface/slot/canvas-object';

/**
 * Object drawn on a shared canvas, discriminated by `type`.
 * Shapes are anchored at `x`/`y`; a path is a list of points.
 */
export type CanvasObject =
	| (SlotCanvasObject & {
			type: 'rectangle';
			x: number;
			y: number;
			width?: number;
			height?: number;
	  })
	| (SlotCanvasObject & { type: 'circle'; x: number; y: number; radius?: number })
	| (SlotCanvasObject & { type: 'text'; x: number; y: number; text?: string })
	| (SlotCanvasObject & { type: 'path'; points: Point2D[] });
