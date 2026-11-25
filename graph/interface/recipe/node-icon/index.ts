import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { HTMLAttributes } from 'svelte/elements';
export interface RecipeNodeIcon extends ComputeIntersectAll<[HTMLAttributes<HTMLDivElement>]> {
	icon?: string;
	size?: number;
	accent?: string;
	background?: string;
}
