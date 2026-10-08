import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotIdef0 } from '$stylist/idef-zero/interface/slot/idef0';
export interface RecipeIdef0BlackBox extends ComputeIntersectAll<[SlotTheme, SlotIdef0]> {
	inputs: {
		id: string;
		label?: string;
		color?: string;
	}[];
	outputs: {
		id: string;
		label?: string;
		color?: string;
	}[];
	boxWidth?: number;
	boxHeight?: number;
}
