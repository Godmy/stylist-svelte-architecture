import type { ZwickyLevel } from '$stylist/graph/type/alias/zwicky-level';

export interface ZwickyFilterState {
	domains: Set<string>;
	levels: Set<ZwickyLevel>;
	query: string;
	hoveredId: string | null;
	selectedId: string | null;
}
