import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SlotCanvasObject } from '$stylist/canvas/interface/slot/canvas-object';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';
import type { CanvasFont } from '$stylist/canvas/type/object/canvas-font';
import type { CanvasShapeKind } from '$stylist/canvas/type/alias/canvas-shape-kind';
import type { TokenIconName } from '$stylist/svg/type/alias/icon-name';

/**
 * Object on a shared canvas, discriminated by `type`, in world coordinates.
 * Box objects occupy `x`/`y`/`width`/`height`; `line` and `path` are point lists.
 * `color` is the stroke or text color, `fill` the background.
 */
export type CanvasObject =
	| (SlotCanvasObject &
			SlotSharedCanvasObjectBounds & {
				type: 'shape';
				shape: CanvasShapeKind;
				fill?: string;
				strokeWidth?: number;
				text?: string;
				font?: CanvasFont;
			})
	| (SlotCanvasObject &
			SlotSharedCanvasObjectBounds & { type: 'text'; text: string; font?: CanvasFont })
	| (SlotCanvasObject &
			SlotSharedCanvasObjectBounds & {
				type: 'sticky';
				text: string;
				fill?: string;
				font?: CanvasFont;
			})
	| (SlotCanvasObject &
			SlotSharedCanvasObjectBounds & { type: 'frame'; title?: string; fill?: string })
	| (SlotCanvasObject & SlotSharedCanvasObjectBounds & { type: 'icon'; icon: TokenIconName })
	| (SlotCanvasObject & {
			type: 'line';
			points: [Point2D, Point2D];
			arrow?: boolean;
			strokeWidth?: number;
	  })
	| (SlotCanvasObject & { type: 'path'; points: Point2D[]; strokeWidth?: number });
