import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotClass } from '$stylist/theme/interface/slot/class';

export interface RecipeColorPalette
	extends ComputeIntersectAll<[HTMLAttributes<HTMLDivElement>, SlotClass]> {
	value?: string;
	disabled?: boolean;
	showInput?: boolean;
	showPalette?: boolean;
	onInput?: (value: string) => void;
	onChange?: (value: string) => void;
}
