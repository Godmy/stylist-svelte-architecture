import GraphLegend from './index.svelte';
import type { RecipeGraphLegend } from '$stylist/graph/interface/recipe/graph-legend';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Domain color legend of the Zwicky graph; index.story.svelte toggles the domains. */
export default {
	component: GraphLegend,
	title: 'GraphLegend',
	description:
		'Domain color legend of the Zwicky graph: one colored dot per domain. Click a domain to toggle its highlight.'
} satisfies ContractStory<RecipeGraphLegend>;
