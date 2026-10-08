import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { SlotText } from '$stylist/typography/interface/slot/text';
export interface RecipeIdef0Connector extends ComputeIntersectAll<[SlotTheme, SlotText]> {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	label: string;
	direction?: 'input' | 'output';
	showArrow?: boolean;
	color?: string;
}
