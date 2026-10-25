import type { Snippet } from 'svelte';
import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenSize } from '$stylist/design-token/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
import type { TokenIconName } from '$stylist/svg/type/alias/icon-name';
export interface RecipeNodeHeader extends ComputeIntersectAll<
	[SlotWorkspaceNode, SlotTheme, HTMLAttributes<HTMLDivElement>]
> {
	icon?: TokenIconName;
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
