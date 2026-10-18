import type { ZwickyNode } from '$stylist/graph/interface/slot/zwicky-node';

export interface RecipeGraphTooltip {
	node: ZwickyNode | null;
	x: number;
	y: number;
	containerWidth?: number;
	containerHeight?: number;
}
