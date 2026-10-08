import type { RecipeWorkspaceNode } from '$stylist/workspace/interface/recipe/workspace-node';
import type { Snippet } from 'svelte';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';

export interface RecipeMinimap extends ComputeIntersectAll<[SlotDimensionable]> {
	nodes?: readonly RecipeWorkspaceNode[];
	zoom?: number;
	offset?: Point2D;
	miniMapZoom?: number;
	showZoomControls?: boolean;
	showViewport?: boolean;
	nodeColor?: string;
	activeNodeColor?: string;
	viewportColor?: string;
	backgroundColor?: string;
	gridColor?: string;
	onOffsetChange?: (offset: Point2D) => void;
	onZoomChange?: (zoom: number) => void;
	onMapClick?: (position: Point2D) => void;
	children?: Snippet;
	class?: string;
}
