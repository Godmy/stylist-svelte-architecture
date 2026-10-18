import GraphClusterFilter from './index.svelte';
import type { RecipeGraphClusterFilter } from '$stylist/graph/interface/recipe/graph-cluster-filter';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Assembly-layer pills of the Zwicky graph; index.story.svelte toggles them. */
export default {
	component: GraphClusterFilter,
	title: 'GraphClusterFilter',
	description:
		'Assembly-layer filter of the Zwicky graph: one pill per cluster in assembly order. Click a pill to toggle its layer.'
} satisfies ContractStory<RecipeGraphClusterFilter>;
