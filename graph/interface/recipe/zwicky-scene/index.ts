import type { HTMLAttributes } from 'svelte/elements';
import type { GraphTheme } from '$stylist/graph/type/alias/graph-theme';
import type { GraphJsonInput } from '$stylist/graph/interface/slot/graph-json-input';
import type { ZwickyScheme } from '$stylist/graph/interface/slot/zwicky-scheme';
import type { ZwickyText } from '$stylist/graph/interface/slot/zwicky-text';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';

export interface RecipeZwickyScene extends ComputeIntersectAll<
	[
		HTMLAttributes<HTMLDivElement> & {
			title?: string;
			data?: GraphJsonInput;
			/** Own clusters and domains instead of the library's assembly layers. */
			scheme?: ZwickyScheme;
			/** 'dark' by default; 'light' for a light page. */
			theme?: GraphTheme;
			text?: ZwickyText;
			canvasClass?: string;
			overlayClass?: string;
			class?: string;
			onNodeSelect?: (nodeId: string, path: string) => void;
			panelHeading?: boolean;
			panelMetrics?: boolean;
			onViewChange?: (view: {
				nodes: number;
				edges: number;
				totalNodes: number;
				totalEdges: number;
				filters: number;
			}) => void;
		}
	]
> {}
