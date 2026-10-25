import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenPropertyType } from '$stylist/workspace/type/alias/property-type';
import type { TokenSize } from '$stylist/design-token/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
import type { TokenIconName } from '$stylist/svg/type/alias/icon-name';
export interface RecipeNodePort extends ComputeIntersectAll<
	[SlotWorkspaceNode, SlotTheme, HTMLAttributes<HTMLDivElement>]
> {
	direction?: 'input' | 'output';
	dataType?: TokenPropertyType | string;
	size?: TokenSize;
	index?: number;
	connected?: boolean;
	active?: boolean;
	icon?: TokenIconName | Snippet;
	onConnectionStart?: (event: MouseEvent) => void;
	onConnectionEnd?: (event: MouseEvent) => void;
}
