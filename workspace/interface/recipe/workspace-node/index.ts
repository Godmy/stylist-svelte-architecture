import type { SemanticZoomPresentation } from '$stylist/presentation/interface/slot/semantic-zoom';
import type { Snippet } from 'svelte';
import type { SlotTheme } from '$stylist/theme/interface/slot/theme';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
export interface RecipeWorkspaceNode
	extends ComputeIntersectAll<[SlotWorkspaceNode, SlotTheme, HTMLAttributes<HTMLDivElement>]> {
	x: number;
	y: number;
	type?: 'default' | 'custom' | 'source' | 'processor' | 'output' | 'gateway';
	mode?: string;
	status?: string;
	size?: TokenSize;
	selected?: boolean;
	draggable?: boolean;
	selectable?: boolean;
	resizable?: boolean;
	deletable?: boolean;
	duplicable?: boolean;
	width?: number;
	minWidth?: number;
	height?: number | 'auto';
	headerColor?: string;
	hideHeader?: boolean;
	hidePorts?: boolean;
	hideProperties?: boolean;
	showActions?: boolean;
	onNodeSelect?: (nodeId?: string) => void;
	onNodeDrag?: (nodeId: string | undefined, position: { x: number; y: number }) => void;
	onNodeResize?: (
		nodeId: string | undefined,
		size: { width?: number; height?: number | 'auto' }
	) => void;
	ondelete?: (nodeId?: string) => void;
	onduplicate?: (nodeId?: string) => void;
	onConnectionStart?: (port: SlotWorkspaceNode, event: MouseEvent) => void;
	onConnectionEnd?: (port: SlotWorkspaceNode, event: MouseEvent) => void;
	onPropertyChange?: (propertyId: string, value: unknown) => void;
	canvasZoom?: number;
	worldDepth?: number;
	cameraDepth?: number;
	presentation?: Partial<SemanticZoomPresentation> & {
		stage?: SemanticZoomPresentation['stage'];
		size?: TokenSize;
		width?: number;
		height?: number | 'auto';
		showChildren?: boolean;
	};
	properties?: SlotWorkspaceNode[];
	inputs?: SlotWorkspaceNode[];
	outputs?: SlotWorkspaceNode[];
	headerContent?: Snippet;
	bodyContent?: Snippet;
}
