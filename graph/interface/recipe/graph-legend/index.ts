export interface RecipeGraphLegend {
	activeDomains?: Set<string>;
	onDomainClick?: (domain: string) => void;
}
