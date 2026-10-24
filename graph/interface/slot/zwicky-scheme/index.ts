import type { ZwickyGroup } from '$stylist/graph/interface/slot/zwicky-group';

/**
 * The axes of a Zwicky box other than the library's own: clusters are the lanes along X
 * (their order, colour and filter pills), domains the planes along Z (the legend).
 * Without a scheme the scene keeps the library's assembly layers and domains.
 */
export interface ZwickyScheme {
	clusters: readonly ZwickyGroup[];
	domains?: readonly ZwickyGroup[];
	/** Light theme: the colour mixed into every edge (RGB 0..1), white when absent. */
	edgeTint?: readonly [number, number, number];
	/** Under a filter: 'both' (default) keeps edges inside the chosen groups, 'any' also their links out. */
	edgeFilter?: 'both' | 'any';
}
