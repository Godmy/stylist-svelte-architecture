export interface RecipeGraphClusterFilter {
	activeClusters?: ReadonlySet<string>;
	onClusterClick?: (cluster: string) => void;
}
