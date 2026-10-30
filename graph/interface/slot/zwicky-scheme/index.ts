import type { ZwickyGroup } from '$stylist/graph/interface/slot/zwicky-group';

/**
 * The axes of a Zwicky box other than the library's own: clusters are the lanes along X
 * (their order, colour and filter pills), domains the planes along Z (the legend).
 * `radialLayout` arranges clusters around a shared vertical axis instead of lanes.
 * Without a scheme the scene keeps the library's assembly layers and domains.
 */
export interface ZwickyScheme {
	clusters: readonly ZwickyGroup[];
	domains?: readonly ZwickyGroup[];
	/** Vertical layout multiplier (Y only); defaults to 1. */
	heightScale?: number;
	/** Multiplies final coordinates on all axes; node sizes stay unchanged. */
	layoutScale?: number;
	/** Explicit scene coordinates override the automatic layout for these nodes. */
	positions?: Record<string, readonly [number, number, number]>;
	/** Marker size multipliers by cluster, independent of map coordinates. */
	nodeScale?: Readonly<Record<string, number>>;
	/** Faceted filters: OR within a group, AND between groups; empty selection means all. */
	filterGroups?: readonly {
		id: string;
		label: string;
		options: readonly { id: string; label: string; nodeIds: readonly string[] }[];
	}[];
	/** Decorative polylines: map outlines or lane guides, never selectable graph edges. */
	referenceLines?: readonly {
		points: readonly (readonly [number, number, number])[];
		color: readonly [number, number, number];
	}[];
	/** Starting orbit; users can still rotate freely. */
	camera?: { horizontalAngle: number; verticalAngle: number };
	/** Concentric groups around Y instead of the default matrix lanes. */
	radialLayout?: readonly {
		cluster: string;
		/** Radius in scene units; for spheres, scales the cube root of their article count. */
		radius: number;
		shape: 'axis' | 'cone' | 'ring' | 'spheres';
		/** Spheres group nodes by their first dependency in this cluster; otherwise by domain. */
		anchorCluster?: string;
	}[];
	/** Light theme: the colour mixed into every edge (RGB 0..1), white when absent. */
	edgeTint?: readonly [number, number, number];
	/** Unselected graph edge opacity; decorative reference lines remain legible. */
	edgeOpacity?: number;
	/** Under a filter: 'both' (default) keeps edges inside the chosen groups, 'any' also their links out. */
	edgeFilter?: 'both' | 'any';
}
