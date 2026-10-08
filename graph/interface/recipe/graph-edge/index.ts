import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenTrajectory } from '$stylist/workspace/type/alias/trajectory';
export interface RecipeGraphEdge
	extends ComputeIntersectAll<[SlotTheme, Omit<HTMLAttributes<SVGPathElement>, 'style'>]> {
	directed?: boolean;
	type?: TokenTrajectory;
	active?: boolean;
	style?: Record<string, string>;
}
