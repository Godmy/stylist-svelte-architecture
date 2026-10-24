import type { ZwickyLevel } from '$stylist/graph/type/alias/zwicky-level';

export interface ZwickyNode {
	id: string;
	path: string;
	domain: string;
	cluster: string;
	joint: string;
	family: string;
	/** Display name from GraphJsonInput.labels. */
	label?: string;
	level: ZwickyLevel;
	x: number;
	y: number;
	z: number;
	size: number;
	color: readonly [number, number, number];
	dependencyIds: readonly string[];
}
