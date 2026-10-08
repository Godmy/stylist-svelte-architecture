import type { HTMLAttributes } from 'svelte/elements';
import type { GraphJsonInput } from '$stylist/graph/interface/slot/graph-json-input';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';

export interface RecipeZwickyScene
	extends ComputeIntersectAll<
		[
			HTMLAttributes<HTMLDivElement> & {
				title?: string;
				data?: GraphJsonInput;
				canvasClass?: string;
				overlayClass?: string;
				class?: string;
				onNodeSelect?: (nodeId: string, path: string) => void;
			}
		]
	> {}
