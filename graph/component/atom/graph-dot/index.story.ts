import GraphDot from '$stylist/graph/component/atom/graph-dot/index.svelte';
import type { RecipeGraphDot } from '$stylist/graph/interface/recipe/graph-dot';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Glowing color dot with a label, used by the graph legend. */
export default {
	component: GraphDot,
	title: 'GraphDot',
	description: 'Glowing color dot with a label; the color is an RGB triple in 0..1.',
	args: { color: [0.18, 0.88, 0.76], label: 'graph', size: 8 },
	controls: {
		label: { type: 'text' },
		size: { type: 'range', min: 4, max: 32, step: 1 }
	},
	presets: {
		Interaction: { color: [1.0, 0.34, 0.28], label: 'interaction' },
		Large: { size: 20 }
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: { style: 'padding: 1rem; border-radius: 0.5rem; background: #050810;' },
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeGraphDot>;
