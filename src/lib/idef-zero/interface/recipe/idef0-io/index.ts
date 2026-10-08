import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotText } from '$stylist/typography/interface/slot/text';
export interface RecipeIdef0Io extends ComputeIntersectAll<[SlotTheme, SlotText]> {
	ports: {
		id: string;
		label?: string;
		color?: string;
	}[];
	boxX: number;
	boxY?: number;
	boxHeight: number;
	boxWidth?: number;
	startX?: number;
	endX?: number;
}
