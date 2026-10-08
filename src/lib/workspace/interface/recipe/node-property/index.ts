import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenPropertyType } from '$stylist/workspace/type/alias/property-type';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
export interface RecipeNodeProperty
	extends ComputeIntersectAll<
		[SlotWorkspaceNode, SlotTheme, Omit<HTMLAttributes<HTMLDivElement>, 'onchange'>]
	> {
	id?: string;
	name: string;
	type?: TokenPropertyType;
	value?: unknown;
	defaultValue?: unknown;
	size?: TokenSize;
	editable?: boolean;
	typeEditable?: boolean;
	min?: number;
	max?: number;
	step?: number;
	prefix?: string;
	suffix?: string;
	error?: boolean;
	errorMessage?: string;
	placeholder?: string;
	onchange?: (name: string, value: unknown) => void;
}
