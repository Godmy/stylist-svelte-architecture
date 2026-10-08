import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenRelationship } from '$stylist/workspace/type/alias/relationship';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { RecipeNodePort } from '$stylist/workspace/interface/recipe/node-port';
export interface RecipeNodePortGroup
	extends ComputeIntersectAll<[SlotTheme, HTMLAttributes<HTMLDivElement>]> {
	title?: string;
	direction?: TokenRelationship;
	portSize?: TokenSize;
	ports?: RecipeNodePort[];
	showLabels?: boolean;
	showTypeIcons?: boolean;
	compact?: boolean;
	divider?: boolean;
	onPortClick?: (portId: string, event: MouseEvent) => void;
	onConnectionStart?: (port: RecipeNodePort, event: MouseEvent) => void;
	onConnectionEnd?: (port: RecipeNodePort, event: MouseEvent) => void;
}
