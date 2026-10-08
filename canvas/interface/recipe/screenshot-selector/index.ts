import type { SlotThemeBorder } from '$stylist/theme/interface/slot/theme-border';
import type { SlotTypography } from '$stylist/theme/interface/slot/typography';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
export interface RecipeScreenshotSelector
	extends ComputeIntersectAll<[SlotThemeBorder, SlotTypography]> {
	drawingMode?: boolean;
	drawColor?: string;

	class?: string;
}
