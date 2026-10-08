import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';

export interface SlotCanvasObject {
	[key: string]: any;
	id: string;
	type?: string;
	points?: Point2D[];
}
