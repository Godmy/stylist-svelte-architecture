import type { Snippet } from 'svelte';
import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
export interface RecipeNodeHeader
	extends ComputeIntersectAll<[SlotWorkspaceNode, SlotTheme, HTMLAttributes<HTMLDivElement>]> {
	icon?: string;
	size?: TokenSize;
	selected?: boolean;
	editable?: boolean;
	showClose?: boolean;
	showSettings?: boolean;
	showDuplicate?: boolean;
	showDelete?: boolean;
	actions?: Snippet;
	onTitleChange?: (value: string) => void;
	onclose?: () => void;
	onsettings?: () => void;
	onduplicate?: () => void;
	ondelete?: () => void;
}
