import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';

export interface RecipeScene
	extends ComputeIntersectAll<
		[
			HTMLAttributes<HTMLDivElement> & {
				title?: string;
				rotateHint?: string;
				zoomHint?: string;
				canvasClass?: string;
				overlayClass?: string;
			}
		]
	> {}
