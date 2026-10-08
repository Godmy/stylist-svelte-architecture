import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { HTMLCanvasAttributes } from 'svelte/elements';
import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';
import type { SlotClass } from '$stylist/theme/interface/slot/class';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';

export interface RecipeDrawingSurface
	extends ComputeIntersectAll<
		[HTMLCanvasAttributes, LayoutHTMLAttributes<HTMLDivElement>, SlotClass, SlotDimensionable]
	> {
	drawingEnabled?: boolean;
	tool?: 'pen' | 'eraser' | 'select';
	strokeColor?: string;
	strokeWidth?: number;
	backgroundColor?: string;
}
