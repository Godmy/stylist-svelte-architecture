import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';

export interface RecipeOntologyNodeComponent {
	node: {
		id: string;
		name: string;
		label?: string;
		type: string;
		position: Point2D;
		width: number;
		height: number;
		attributes?: string[];
	};
	showLabel?: boolean;
	class?: string;
}
