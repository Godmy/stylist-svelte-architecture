import type { HTMLAttributes } from 'svelte/elements';
import type { SlotChildren } from '$stylist/theme/interface/slot/children';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
export interface RecipeGraphNodeCard
	extends ComputeIntersectAll<[SlotWorkspaceNode, HTMLAttributes<HTMLDivElement>, SlotChildren]> {
	node: SlotWorkspaceNode;
	expanded?: boolean;
	showDetails?: boolean;
	selected?: boolean;
	highlight?: boolean;
	variant?: string;
	size?: string;
	fields?: { name: string; type: string; isRequired?: boolean }[];
	class?: string;
}
