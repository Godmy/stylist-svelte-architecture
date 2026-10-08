import type { GraphNodeCategory } from '$stylist/graph/type/alias/graph-node-category';

export interface GraphNodeDraft {
	title: string;
	category: GraphNodeCategory;
	summary: string;
	color: string;
	accent: string;
	width: number;
	height: number;
	details: string;
}
