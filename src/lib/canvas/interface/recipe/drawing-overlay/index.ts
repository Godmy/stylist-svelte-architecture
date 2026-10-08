import type { SlotClass } from '$stylist/theme/interface/slot/class';
import type { SlotThemeBorder } from '$stylist/theme/interface/slot/theme-border';
import type { SlotTypography } from '$stylist/theme/interface/slot/typography';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
export interface RecipeDrawingOverlay
	extends ComputeIntersectAll<[SlotThemeBorder, SlotTypography, SlotClass]> {
	drawColor?: string;
	onClose?: () => void;
}
