import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenSize } from '$stylist/theme/type/alias/size';
export interface RecipeGraphNode
	extends ComputeIntersectAll<[SlotTheme, HTMLAttributes<HTMLDivElement>]> {
	id: string;
	x: number;
	y: number;
	label?: string;
	type?: string;
	interactive?: boolean;
	size?: TokenSize;
	color?: string;
	selected?: boolean;
}
