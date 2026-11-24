import type { SlotThemeBorder } from '$stylist/theme/interface/slot/theme-border';
import type { SlotTypography } from '$stylist/typography/interface/slot/typography';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';

/**
 * Full-viewport overlay: drag to select a region (viewport pixels), then, in
 * drawing mode, annotate the page. Escape cancels.
 */
export interface RecipeScreenshotSelector extends ComputeIntersectAll<
	[SlotThemeBorder, SlotTypography]
> {
	drawingMode?: boolean;
	/** Annotation color; CSS custom properties are accepted. */
	drawColor?: string;
	strokeWidth?: number;
	onSelect?: (rect: SlotSharedCanvasObjectBounds) => void;
	onCancel?: () => void;
	class?: string;
}
