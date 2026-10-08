import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenBorderStyle } from '$stylist/layout/type/alias/border-style';
import type { SlotNodeConnection } from '$stylist/workspace/interface/slot/node-connection';
export interface RecipeNodeConnection
	extends ComputeIntersectAll<[SlotNodeConnection, SlotTheme, HTMLAttributes<SVGPathElement>]> {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	style?: string;
	lineStyle?: TokenBorderStyle;
	strokeWidth?: number;
	width?: number;
	activeColor?: string;
	hoverColor?: string;
	animated?: boolean;
	showArrow?: boolean;
	arrowSize?: number;
	label?: string;
	labelPosition?: 'start' | 'middle' | 'end';
}
