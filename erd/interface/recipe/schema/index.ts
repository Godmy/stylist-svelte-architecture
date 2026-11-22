import type { Snippet } from 'svelte';
import type { SlotErdSettings } from '$stylist/erd/interface/slot/erd-settings';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
export interface RecipeSchema extends ComputeIntersectAll<[SlotErdSettings]> {
	/** Wrap or host the live header elsewhere while retaining the schema's state. */
	header?: Snippet<[Snippet]>;
}
