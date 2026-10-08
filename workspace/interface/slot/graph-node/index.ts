import type { GraphNodeCategory } from '$stylist/graph/type/alias/graph-node-category';

export interface GraphNode {
	id: string;
	title: string;
	category: GraphNodeCategory;
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
	accent: string;
	summary: string;
	details: readonly string[];
	shape: 'rounded' | 'pill' | 'circle';
}
