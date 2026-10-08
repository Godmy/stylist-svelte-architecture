import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';
import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
export interface RecipePreziScene
	extends ComputeIntersectAll<[LayoutHTMLAttributes<HTMLDivElement>]> {
	nodes?: readonly SceneNode[];
	initialCamera?: {
		x: number;
		y: number;
		zoom: number;
	};
	initialDepth?: number;
	targetCamera?: {
		x: number;
		y: number;
		zoom: number;
		depth: number;
	} | null;
	showGrid?: boolean;
	showMinimap?: boolean;
	showInspector?: boolean;
	showHeader?: boolean;
	title?: string;
	subtitle?: string;
	panMode?: 'drag' | 'space' | 'always';
	zoomEnabled?: boolean;
	panEnabled?: boolean;
	minZoom?: number;
	maxZoom?: number;
	animationDurationMs?: number;
	selectedNodeId?: string | null;
	showLinks?: boolean;
	onNodeSelect?: (node: SceneNode | null) => void;
	onCameraChange?: (camera: { x: number; y: number; zoom: number }) => void;
	onDepthChange?: (depth: number) => void;
}
