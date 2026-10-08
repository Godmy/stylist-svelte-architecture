import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';

export interface RecipeOntologyEdgeComponent {
	edge: {
		id: string;
		source: string;
		target: string;
		relationship: string;
		label?: string;
		cardinality?: string;
	};
	sourceNode: ComputeIntersectAll<
		[
			SlotDimensionable,
			{
				id: string;
				name: string;
				type?: string;
				label?: string;
				position?: Point2D;
				attributes?: string[];
			}
		]
	>;
	targetNode: ComputeIntersectAll<
		[
			SlotDimensionable,
			{
				id: string;
				name: string;
				type?: string;
				label?: string;
				position?: Point2D;
				attributes?: string[];
			}
		]
	>;
	showLabel?: boolean;
	class?: string;
}
