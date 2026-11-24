import type { SlotClass } from '$stylist/theme/interface/slot/class';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { CanvasStroke } from '$stylist/canvas/type/object/canvas-stroke';

/** Fixed full-viewport annotation layer; Escape calls `onClose`. */
export interface RecipeDrawingOverlay extends ComputeIntersectAll<[SlotClass]> {
	/** Pen color; CSS custom properties are accepted. */
	drawColor?: string;
	strokeWidth?: number;
	/** Space left free at the top (for example under an app header), in CSS pixels. */
	offsetTop?: number;
	onClose?: () => void;
	onChange?: (strokes: CanvasStroke[]) => void;
}
