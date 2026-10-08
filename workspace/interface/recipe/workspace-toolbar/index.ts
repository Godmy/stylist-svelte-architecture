import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
export interface RecipeWorkspaceToolbar
	extends ComputeIntersectAll<[SlotTheme, HTMLAttributes<HTMLDivElement>]> {
	label?: string;
	size?: TokenSize;
	orientation?: 'horizontal' | 'vertical';
	compact?: boolean;
	showTooltips?: boolean;
	items?: SlotWorkspaceNode[];
	onItemClick?: (id: string) => void;
	onValueChange?: (id: string, value: unknown) => void;
}
