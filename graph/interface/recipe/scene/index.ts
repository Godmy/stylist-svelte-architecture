import type { HTMLAttributes } from 'svelte/elements';
import type { GraphTheme } from '$stylist/graph/type/alias/graph-theme';
import type { GraphConnection } from '$stylist/graph/interface/slot/graph-connection';
import type { GraphNode } from '$stylist/graph/interface/slot/graph-scene-node';
import type { SceneText } from '$stylist/graph/interface/slot/scene-text';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SceneGraph } from '$stylist/graph/interface/slot/scene-graph';
import type { SceneDebugInfo } from '$stylist/graph/interface/slot/scene-debug-info';

export interface RecipeScene extends ComputeIntersectAll<
	[
		HTMLAttributes<HTMLDivElement> & {
			title?: string;
			rotateHint?: string;
			zoomHint?: string;
			/** Own graph instead of the built-in demonstration; connections need both ends. */
			nodes?: readonly GraphNode[];
			connections?: readonly GraphConnection[];
			/** Prepared geometry rendered with the same scene and camera controls. */
			graph?: SceneGraph;
			focusId?: string;
			showOverlay?: boolean;
			onmetricschange?: (
				metrics: Pick<SceneDebugInfo, 'graphNodes' | 'graphConnections' | 'drawCount'>
			) => void;
			/** 'dark' by default; 'light' for a light page. */
			theme?: GraphTheme;
			text?: SceneText;
			canvasClass?: string;
			overlayClass?: string;
		}
	]
> {}
