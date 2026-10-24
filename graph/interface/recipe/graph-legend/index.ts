import type { ZwickyGroup } from '$stylist/graph/interface/slot/zwicky-group';

export interface RecipeGraphLegend {
	activeDomains?: Set<string>;
	/** Own domains instead of the library's; with them the legend lists only these. */
	domains?: readonly ZwickyGroup[];
	title?: string;
	onDomainClick?: (domain: string) => void;
}
