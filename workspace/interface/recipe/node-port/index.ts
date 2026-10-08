import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenPropertyType } from '$stylist/workspace/type/alias/property-type';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
export interface RecipeNodePort
	extends ComputeIntersectAll<[SlotWorkspaceNode, SlotTheme, HTMLAttributes<HTMLDivElement>]> {
	direction?: 'input' | 'output';
	dataType?: TokenPropertyType | string;
	size?: TokenSize;
	index?: number;
	connected?: boolean;
	active?: boolean;
	icon?: string | Snippet;
	onConnectionStart?: (event: MouseEvent) => void;
	onConnectionEnd?: (event: MouseEvent) => void;
}
