import type { ZwickyGroup } from '$stylist/graph/interface/slot/zwicky-group';

export interface RecipeGraphClusterFilter {
	activeClusters?: ReadonlySet<string>;
	/** Own clusters instead of the library's assembly layers. */
	clusters?: readonly ZwickyGroup[];
	title?: string;
	onClusterClick?: (cluster: string) => void;
}
