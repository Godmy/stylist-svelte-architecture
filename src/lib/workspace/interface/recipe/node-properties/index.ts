import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotChildren } from '$stylist/theme/interface/slot/children';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
export interface RecipeNodeProperties
	extends ComputeIntersectAll<[SlotTheme, SlotChildren, HTMLAttributes<HTMLElement>]> {
	nodeId?: string;
	title?: string;
	visible?: boolean;
	properties?: readonly SlotWorkspaceNode[];
	size?: TokenSize;
	compact?: boolean;
	showHeader?: boolean;
	showClose?: boolean;
	editable?: boolean;
	groupByType?: boolean;
	onPropertyChange?: (propertyId: string, value: unknown) => void;
}
