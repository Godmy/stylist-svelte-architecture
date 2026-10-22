import GraphNodeCard from '$stylist/workspace/component/molecule/graph-node-card/index.svelte';
import type { RecipeGraphNodeCard } from '$stylist/workspace/interface/recipe/graph-node-card';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Graph node card component for displaying node information. */
export default {
	component: GraphNodeCard,
	title: 'GraphNodeCard',
	description: 'Graph node card component for displaying node information.',
	args: {
		node: {
			id: '1',
			name: 'User Node',
			type: 'object',
			description: 'Represents a user in the system',
			fields: [
				{ name: 'id', type: 'ID', isRequired: true },
				{ name: 'name', type: 'String', isRequired: true },
				{ name: 'email', type: 'String' }
			]
		},
		expanded: false,
		selected: false,
		highlight: false,
		showDetails: true
	},
	controls: {
		expanded: { type: 'boolean' },
		selected: { type: 'boolean' },
		highlight: { type: 'boolean' },
		showDetails: { type: 'boolean' }
	}
} satisfies ContractStory<RecipeGraphNodeCard>;
